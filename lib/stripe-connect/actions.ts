'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Result = { ok: true } | { error: string }

interface SplitInput {
  payee_user_id: string
  percent_basis_points: number
  role: string | null
  stripe_account_id: string | null
}

function parseSplit(formData: FormData): SplitInput | { error: string } {
  const payeeUserId = ((formData.get('payee_user_id') as string | null) || '').trim()
  if (!payeeUserId) return { error: 'Pick a payee.' }
  const percentStr = ((formData.get('percent') as string | null) || '').trim()
  const percentNum = Number(percentStr)
  if (!Number.isFinite(percentNum) || percentNum <= 0 || percentNum > 100) {
    return { error: 'Percent must be 0–100.' }
  }
  // Convert percent (1-100) to basis points (100-10000). One decimal
  // place of resolution is enough for tour-finance splits.
  const percent_basis_points = Math.round(percentNum * 100)
  const role = ((formData.get('role') as string | null) || '').trim() || null
  const stripe_account_id =
    ((formData.get('stripe_account_id') as string | null) || '').trim() || null
  return {
    payee_user_id: payeeUserId,
    percent_basis_points,
    role,
    stripe_account_id,
  }
}

export async function upsertRevenueSplit(
  tourId: string,
  formData: FormData,
): Promise<Result> {
  const parsed = parseSplit(formData)
  if ('error' in parsed) return parsed
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { error } = await supabase
    .from('tour_revenue_splits')
    .upsert(
      {
        tour_id: tourId,
        ...parsed,
        active: true,
        created_by: user.id,
      },
      { onConflict: 'tour_id,payee_user_id' },
    )
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/finances/splits`)
  return { ok: true }
}

export async function deleteRevenueSplit(
  tourId: string,
  splitId: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tour_revenue_splits')
    .delete()
    .eq('id', splitId)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/finances/splits`)
  return { ok: true }
}

/**
 * Creates or refreshes a Stripe Connect Express onboarding link for
 * the org. Returns the URL the admin should send the org owner to.
 *
 * Idempotent: if the org already has a connected account row we
 * reuse the existing stripe_account_id and generate a fresh
 * AccountLink against it. Otherwise we create the Express account
 * first.
 */
export async function createConnectOnboardingLink(
  orgId: string,
  returnUrl: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return {
      error:
        'Stripe not configured — STRIPE_SECRET_KEY missing. Set it before onboarding payees.',
    }
  }
  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(stripeKey)

  // Look up an existing connected account for this org.
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('stripe_connected_accounts')
    .select('stripe_account_id, onboarding_complete')
    .eq('org_id', orgId)
    .maybeSingle()

  let accountId = existing?.stripe_account_id

  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { org_id: orgId, created_by: user.id },
      })
      accountId = account.id
      await admin.from('stripe_connected_accounts').upsert(
        {
          org_id: orgId,
          stripe_account_id: account.id,
          charges_enabled: false,
          payouts_enabled: false,
          onboarding_complete: false,
        },
        { onConflict: 'org_id' },
      )
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Could not create account.',
      }
    }
  }

  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${returnUrl}?refresh=1`,
      return_url: returnUrl,
      type: 'account_onboarding',
    })
    return { url: link.url }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Could not start onboarding.',
    }
  }
}

/**
 * Refreshes the cached charges_enabled / payouts_enabled flags from
 * Stripe and writes them to stripe_connected_accounts. Called after
 * the user returns from the Stripe-hosted onboarding flow.
 */
export async function refreshConnectedAccountStatus(
  orgId: string,
): Promise<Result> {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return { error: 'Stripe not configured.' }
  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(stripeKey)

  const admin = createAdminClient()
  const { data: row } = await admin
    .from('stripe_connected_accounts')
    .select('stripe_account_id')
    .eq('org_id', orgId)
    .maybeSingle()
  if (!row?.stripe_account_id) return { error: 'No connected account.' }

  try {
    const acct = await stripe.accounts.retrieve(row.stripe_account_id)
    const detailsSubmitted = (acct.details_submitted ?? false) as boolean
    await admin
      .from('stripe_connected_accounts')
      .update({
        charges_enabled: !!acct.charges_enabled,
        payouts_enabled: !!acct.payouts_enabled,
        onboarding_complete: detailsSubmitted,
        country: acct.country ?? null,
        last_status_refresh_at: new Date().toISOString(),
      })
      .eq('org_id', orgId)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Stripe error.' }
  }
  revalidatePath('/admin/stripe-connect')
  return { ok: true }
}
