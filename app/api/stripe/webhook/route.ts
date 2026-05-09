import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { signTicket } from '@/lib/tickets/sign'
import { sendEmail, isMailgunConfigured } from '@/lib/email/mailgun'

async function issueTickets(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
) {
  const showId = session.metadata?.show_id
  const ticketTypeId = session.metadata?.ticket_type_id
  const qtyRaw = session.metadata?.qty
  const purchaserEmail = session.metadata?.purchaser_email || session.customer_email
  const purchaserUserId = session.metadata?.purchaser_user_id || null
  const purchaserName = session.metadata?.purchaser_name || null

  if (!showId || !ticketTypeId || !qtyRaw || !purchaserEmail) {
    console.error('ticket webhook: missing metadata', session.id)
    return
  }
  const qty = Number.parseInt(qtyRaw, 10)
  if (!Number.isFinite(qty) || qty < 1) return

  // Idempotency: if any ticket already exists for this session, skip.
  const { count: existing } = await supabase
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('stripe_session_id', session.id)
  if ((existing ?? 0) > 0) return

  const amountTotal = (session.amount_total ?? 0) / 100
  const perTicket = amountTotal / qty

  const issuedAt = new Date().toISOString()
  const rows = Array.from({ length: qty }, () => {
    const id = randomUUID()
    const signature = signTicket({ id, show_id: showId, issued_at: issuedAt })
    return {
      id,
      ticket_type_id: ticketTypeId,
      show_id: showId,
      purchaser_user_id: purchaserUserId || null,
      purchaser_email: purchaserEmail,
      purchaser_name: purchaserName,
      stripe_session_id: session.id,
      stripe_payment_intent_id: (session.payment_intent as string) || null,
      amount_paid: perTicket,
      status: 'issued' as const,
      signature,
      issued_at: issuedAt,
    }
  })

  const { error: insertErr } = await supabase.from('tickets').insert(rows)
  if (insertErr) {
    console.error('ticket webhook: insert failed', insertErr)
    return
  }

  await supabase.rpc('increment_ticket_sold', {
    _id: ticketTypeId,
    _n: qty,
  })

  if (isMailgunConfigured()) {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://tour.witus.online'
    const links = rows
      .map(
        (r, i) =>
          `<li><a href="${origin}/tickets/${r.id}">Ticket ${i + 1}</a></li>`,
      )
      .join('')
    try {
      await sendEmail({
        to: purchaserEmail,
        subject: `Your ticket${qty > 1 ? 's' : ''} — order ${session.id.slice(-8)}`,
        tags: ['ticket', 'ticket:purchase'],
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="margin:0 0 16px;">Your ticket${qty > 1 ? 's are' : ' is'} ready</h2>
            <p style="color:#444;margin:0 0 16px;">
              Show your QR code at the door. Don't share these links — each
              ticket can be scanned once.
            </p>
            <ul style="padding-left:20px;line-height:1.8;">${links}</ul>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
              — Tour Manager OS | Tour.WitUS.Online
            </p>
          </div>
        `,
      })
    } catch (err) {
      console.error('ticket webhook: email send failed', err)
    }
  }
}

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const stripe = new Stripe(stripeKey)
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.metadata?.kind === 'ticket') {
        await issueTickets(supabase, session)
        break
      }

      const userId = session.metadata?.user_id
      const subscriptionType = session.metadata?.subscription_type as 'lifetime' | 'annual'

      if (!userId || !subscriptionType) break

      // Create subscription record
      await supabase.from('subscriptions').insert({
        user_id: userId,
        type: subscriptionType,
        status: 'active',
        stripe_customer_id: session.customer as string || null,
        stripe_subscription_id: session.subscription as string || null,
        stripe_payment_intent_id: session.payment_intent as string || null,
        amount: (session.amount_total || 10329) / 100,
        started_at: new Date().toISOString(),
        expires_at: subscriptionType === 'annual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      })

      // Mark user as paid in org_members
      await supabase
        .from('org_members')
        .update({ is_paid: true })
        .eq('user_id', userId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id)

      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId =
        typeof charge.payment_intent === 'string' ? charge.payment_intent : null
      if (paymentIntentId) {
        const { data: refunded } = await supabase
          .from('tickets')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent_id', paymentIntentId)
          .neq('status', 'refunded')
          .select('ticket_type_id')

        // Decrement quantity_sold by the number of unique tickets refunded,
        // grouped by ticket_type_id.
        if (refunded && refunded.length > 0) {
          const counts = new Map<string, number>()
          for (const r of refunded) {
            counts.set(r.ticket_type_id, (counts.get(r.ticket_type_id) ?? 0) + 1)
          }
          for (const [ticketTypeId, n] of counts) {
            await supabase.rpc('increment_ticket_sold', {
              _id: ticketTypeId,
              _n: -n,
            })
          }
        }
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoiceData = event.data.object as unknown as { subscription?: string }
      const subId = invoiceData.subscription
      if (subId) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
