import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { signTicket } from '@/lib/tickets/sign'
import { sendEmail, isMailgunConfigured } from '@/lib/email/mailgun'
import { logError } from '@/lib/observability/logger'

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
    logError('stripe.webhook.ticket.missing_metadata', null, {
      handler: 'issueTickets',
      stripe_session_id: session.id,
    })
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
    logError('stripe.webhook.ticket.insert_failed', insertErr, {
      handler: 'issueTickets',
      stripe_session_id: session.id,
      qty,
    })
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
          `<li><a href="${origin}/tickets/${r.id}?token=${encodeURIComponent(r.signature)}">Ticket ${i + 1}</a></li>`,
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
      logError('stripe.webhook.ticket.email_failed', err, {
        handler: 'issueTickets',
        stripe_session_id: session.id,
        purchaser_email: purchaserEmail,
      })
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
    logError('stripe.webhook.signature_invalid', err, { handler: 'POST' })
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

      if (session.metadata?.kind === 'merch') {
        await recordMerchOrder(supabase, session)
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

    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      if (intent.metadata?.kind === 'merch_elements') {
        await recordMerchOrderFromIntent(supabase, intent)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

/**
 * Records a paid merch order from a Stripe Checkout session. Idempotent
 * via the unique `stripe_session_id` index — a redelivered webhook
 * hits 23505 and we skip without erroring.
 */
async function recordMerchOrder(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orgId = session.metadata?.org_id
  const productId = session.metadata?.product_id
  const quantity = Number(session.metadata?.quantity || 1)
  const productName = session.metadata?.product_name || 'Merch'
  if (!orgId || !productId) return

  const fanEmail =
    session.customer_details?.email || session.customer_email || ''
  const fanName = session.customer_details?.name || null
  const shippingDetailsAny = (
    session as unknown as {
      shipping_details?: {
        address?: Stripe.Address
        name?: string | null
      }
    }
  ).shipping_details
  const shippingAddress = shippingDetailsAny
    ? {
        name: shippingDetailsAny.name,
        address: shippingDetailsAny.address,
      }
    : null

  const totalAmount = (session.amount_total ?? 0) / 100
  const shippingCost = (session.shipping_cost?.amount_total ?? 0) / 100
  const itemsTotal = Math.max(0, totalAmount - shippingCost)
  const unitPrice = quantity > 0 ? itemsTotal / quantity : itemsTotal

  // Order number is a friendly short id for emails / labels.
  // 4 random alnum chars after the year prefix is enough at our volume.
  const orderNumber = `M-${new Date().getFullYear()}-${session.id.slice(-6).toUpperCase()}`

  const { data: inserted, error } = await supabase
    .from('merch_orders')
    .insert({
      org_id: orgId,
      order_number: orderNumber,
      fan_email: fanEmail,
      fan_name: fanName,
      shipping_address: shippingAddress,
      items_total: itemsTotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      currency: session.currency || 'usd',
      status: 'paid',
      stripe_session_id: session.id,
      stripe_payment_intent: (session.payment_intent as string) || null,
    })
    .select('id')
    .maybeSingle()

  if (error) {
    // Duplicate session id = redelivered webhook; safe to ignore.
    if (error.code !== '23505') {
      logError('stripe.webhook.merch_insert_failed', error, {
        session_id: session.id,
      })
    }
    return
  }

  if (inserted?.id) {
    await supabase.from('merch_order_items').insert({
      order_id: inserted.id,
      product_id: productId,
      product_name: productName,
      unit_price: unitPrice,
      quantity,
      subtotal: itemsTotal,
    })
  }
}

/**
 * Embedded Elements flow: a PaymentIntent (not a Checkout Session)
 * fires `payment_intent.succeeded`. Metadata carries the Shippo rate
 * id; after recording the order we hit Shippo to buy the actual
 * label and stash the label URL + tracking URL on the order.
 *
 * Idempotent on payment_intent.id via the unique stripe_session_id
 * index — we reuse that column for the PI id since each order has
 * exactly one or the other.
 */
async function recordMerchOrderFromIntent(
  supabase: ReturnType<typeof createAdminClient>,
  intent: Stripe.PaymentIntent,
): Promise<void> {
  const orgId = intent.metadata?.org_id
  const productId = intent.metadata?.product_id
  const quantity = Number(intent.metadata?.quantity || 1)
  const productName = intent.metadata?.product_name || 'Merch'
  const rateId = intent.metadata?.rate_id || null
  const shippingAmountCents = Number(intent.metadata?.shipping_amount_cents || 0)
  const itemsTotalCents = Number(intent.metadata?.items_total_cents || 0)
  const fanEmail = intent.metadata?.fan_email || intent.receipt_email || ''
  const fanName = intent.metadata?.fan_name || null
  const shippingCarrier = intent.metadata?.shipping_carrier || null
  const shippingService = intent.metadata?.shipping_service || null
  if (!orgId || !productId || !fanEmail) return

  const shippingObj =
    (intent as unknown as { shipping?: Stripe.PaymentIntent['shipping'] })
      .shipping || null
  const shippingAddress = shippingObj
    ? { name: shippingObj.name, address: shippingObj.address }
    : null

  const totalAmount = intent.amount / 100
  const itemsTotal = itemsTotalCents / 100
  const shippingCost = shippingAmountCents / 100
  const unitPrice = quantity > 0 ? itemsTotal / quantity : itemsTotal
  const orderNumber = `M-${new Date().getFullYear()}-${intent.id.slice(-6).toUpperCase()}`

  const { data: inserted, error } = await supabase
    .from('merch_orders')
    .insert({
      org_id: orgId,
      order_number: orderNumber,
      fan_email: fanEmail,
      fan_name: fanName,
      shipping_address: shippingAddress,
      items_total: itemsTotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      currency: intent.currency,
      status: 'paid',
      stripe_session_id: intent.id, // reused: PI id when Elements flow
      stripe_payment_intent: intent.id,
      shippo_rate_id: rateId,
      shipping_carrier: shippingCarrier,
      shipping_service: shippingService,
    })
    .select('id')
    .maybeSingle()

  if (error) {
    if (error.code !== '23505') {
      logError('stripe.webhook.merch_intent_insert_failed', error, {
        payment_intent: intent.id,
      })
    }
    return
  }

  if (inserted?.id) {
    await supabase.from('merch_order_items').insert({
      order_id: inserted.id,
      product_id: productId,
      product_name: productName,
      unit_price: unitPrice,
      quantity,
      subtotal: itemsTotal,
    })
  }

  // Buy the Shippo label. Non-blocking: if it fails the order is still
  // paid; the band can re-buy from the admin order page later.
  if (rateId && inserted?.id) {
    try {
      const { getShippo } = await import('@/lib/shipping/shippo')
      const shippo = getShippo()
      if (shippo) {
        const tx = await shippo.transactions.create({
          rate: rateId,
          labelFileType: 'PDF_4x6',
          async: false,
        })
        if (tx.status === 'SUCCESS' || tx.status === 'QUEUED') {
          await supabase
            .from('merch_orders')
            .update({
              shippo_transaction_id: tx.objectId,
              shippo_label_url: tx.labelUrl || null,
              shippo_tracking_url: tx.trackingUrlProvider || null,
              tracking_number: tx.trackingNumber || null,
            })
            .eq('id', inserted.id)
        }
      }
    } catch (err) {
      logError('stripe.webhook.shippo_label_failed', err, {
        order_id: inserted.id,
        rate_id: rateId,
      })
    }
  }
}
