import type Stripe from 'stripe'
import type { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/observability/logger'

type Admin = ReturnType<typeof createAdminClient>

interface SplitRow {
  id: string
  percent_basis_points: number
  stripe_account_id: string | null
}

/**
 * After a ticket payment clears, route the agreed-on cut to each
 * recipient Stripe Connect account via stripe.transfers.create.
 *
 * Idempotency: every transfer attempt is recorded in
 * tour_split_transfers with a unique (payment_intent_id, split_id)
 * key. Webhook retries skip rows already marked succeeded; we also
 * pass a stable Stripe `idempotency_key` so the Transfer call itself
 * is safe to re-run.
 *
 * Behaviour when the splits config is incomplete or unattached:
 *   - Splits totalling != 100% are skipped entirely (we'd rather not
 *     route partial payouts than guess).
 *   - Split rows without a stripe_account_id record a `skipped` row
 *     so the audit shows "we knew about this share, but no account
 *     to route to."
 */
export async function executeTourRevenueTransfers(
  supabase: Admin,
  stripe: Stripe,
  args: {
    tourId: string
    paymentIntentId: string | null
    amountCentsTotal: number
    currency: string
  },
): Promise<void> {
  const { tourId, paymentIntentId, amountCentsTotal, currency } = args
  if (!paymentIntentId || amountCentsTotal <= 0) return

  // Get the underlying charge so we can mark transfers source_transaction.
  let chargeId: string | null = null
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    chargeId = (pi.latest_charge as string | null) ?? null
  } catch (err) {
    logError('stripe.connect.pi_retrieve_failed', err, {
      payment_intent_id: paymentIntentId,
    })
    return
  }
  if (!chargeId) return

  const { data: splits } = await supabase
    .from('tour_revenue_splits')
    .select('id, percent_basis_points, stripe_account_id')
    .eq('tour_id', tourId)
    .eq('active', true)
  const rows = (splits || []) as SplitRow[]
  if (rows.length === 0) return

  const total = rows.reduce((s, r) => s + r.percent_basis_points, 0)
  if (total !== 10000) {
    logError('stripe.connect.splits_not_100', null, {
      tour_id: tourId,
      total_basis_points: total,
      payment_intent_id: paymentIntentId,
    })
    return
  }

  for (const row of rows) {
    if (!row.stripe_account_id) {
      // Track "we owed N% but had no account" without trying a transfer.
      await supabase
        .from('tour_split_transfers')
        .upsert(
          {
            tour_id: tourId,
            split_id: row.id,
            payment_intent_id: paymentIntentId,
            destination_account_id: '',
            amount_cents: Math.round(
              (amountCentsTotal * row.percent_basis_points) / 10000,
            ),
            currency,
            status: 'skipped',
            error_message: 'No stripe_account_id on split row.',
          },
          { onConflict: 'payment_intent_id,split_id' },
        )
      continue
    }

    const cents = Math.round(
      (amountCentsTotal * row.percent_basis_points) / 10000,
    )
    if (cents <= 0) continue

    // Use the (payment_intent, split) pair as our Stripe idempotency
    // key so webhook retries land on the same Transfer object.
    const idemKey = `tmos:${paymentIntentId}:${row.id}`

    try {
      const transfer = await stripe.transfers.create(
        {
          amount: cents,
          currency,
          destination: row.stripe_account_id,
          source_transaction: chargeId,
          metadata: {
            kind: 'tour_split',
            tour_id: tourId,
            split_id: row.id,
            payment_intent_id: paymentIntentId,
          },
        },
        { idempotencyKey: idemKey },
      )
      await supabase
        .from('tour_split_transfers')
        .upsert(
          {
            tour_id: tourId,
            split_id: row.id,
            payment_intent_id: paymentIntentId,
            destination_account_id: row.stripe_account_id,
            amount_cents: cents,
            currency,
            stripe_transfer_id: transfer.id,
            status: 'succeeded',
          },
          { onConflict: 'payment_intent_id,split_id' },
        )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'transfer failed'
      logError('stripe.connect.transfer_failed', err, {
        tour_id: tourId,
        split_id: row.id,
        payment_intent_id: paymentIntentId,
        destination_account_id: row.stripe_account_id,
        amount_cents: cents,
      })
      await supabase
        .from('tour_split_transfers')
        .upsert(
          {
            tour_id: tourId,
            split_id: row.id,
            payment_intent_id: paymentIntentId,
            destination_account_id: row.stripe_account_id,
            amount_cents: cents,
            currency,
            status: 'failed',
            error_message: msg.slice(0, 500),
          },
          { onConflict: 'payment_intent_id,split_id' },
        )
    }
  }
}
