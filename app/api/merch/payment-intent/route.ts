import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/observability/logger'

/**
 * Creates a Stripe PaymentIntent for an embedded Elements checkout.
 * The shipping rate id (from /api/merch/shipping-rates) is carried in
 * metadata so the webhook can buy the Shippo label after payment.
 *
 * Body: { product_id, quantity, org_slug, rate_id, shipping_amount_cents,
 *         shipping_carrier, shipping_service, fan_email, fan_name,
 *         ship_to: {line1, line2, city, state, postal_code, country} }
 */
export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey === 'your-stripe-secret-key') {
    return NextResponse.json(
      { error: 'Stripe is not configured.' },
      { status: 503 },
    )
  }

  let body: {
    product_id?: string
    quantity?: number
    org_slug?: string
    rate_id?: string
    shipping_amount_cents?: number
    shipping_carrier?: string
    shipping_service?: string
    fan_email?: string
    fan_name?: string
    ship_to?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const productId = body.product_id?.trim()
  const orgSlug = body.org_slug?.trim()
  const quantity = Math.min(Math.max(Number(body.quantity || 1), 1), 10)
  const rateId = body.rate_id?.trim()
  const shippingAmount = Math.max(0, Math.round(Number(body.shipping_amount_cents || 0)))
  const fanEmail = body.fan_email?.trim().toLowerCase() || ''
  const fanName = body.fan_name?.trim() || ''
  const shipTo = body.ship_to || {}

  if (!productId || !orgSlug || !rateId) {
    return NextResponse.json(
      { error: 'product_id, org_slug, and rate_id are required.' },
      { status: 400 },
    )
  }
  if (!fanEmail || !fanEmail.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }
  if (
    !shipTo.line1 ||
    !shipTo.city ||
    !shipTo.postal_code ||
    !shipTo.country
  ) {
    return NextResponse.json(
      { error: 'Shipping address is incomplete.' },
      { status: 400 },
    )
  }

  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('id, slug')
    .eq('slug', orgSlug)
    .maybeSingle()
  if (!org) {
    return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
  }

  const { data: product } = await admin
    .from('merch_products')
    .select('id, name, price, active, org_id')
    .eq('id', productId)
    .eq('org_id', org.id)
    .maybeSingle()
  if (!product || !product.active) {
    return NextResponse.json({ error: 'Product not available.' }, { status: 404 })
  }

  const itemsTotalCents = Math.round(Number(product.price) * 100) * quantity
  const totalCents = itemsTotalCents + shippingAmount
  if (totalCents < 50) {
    return NextResponse.json(
      { error: 'Order total is below the Stripe minimum.' },
      { status: 400 },
    )
  }

  const stripe = new Stripe(stripeKey)
  try {
    const intent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: fanEmail,
      shipping: {
        name: fanName || 'Customer',
        address: {
          line1: shipTo.line1!,
          line2: shipTo.line2 || undefined,
          city: shipTo.city!,
          state: shipTo.state || undefined,
          postal_code: shipTo.postal_code!,
          country: shipTo.country!,
        },
      },
      metadata: {
        kind: 'merch_elements',
        org_id: org.id,
        org_slug: orgSlug,
        product_id: product.id,
        product_name: product.name.slice(0, 100),
        quantity: String(quantity),
        rate_id: rateId,
        shipping_amount_cents: String(shippingAmount),
        items_total_cents: String(itemsTotalCents),
        fan_email: fanEmail.slice(0, 200),
        fan_name: fanName.slice(0, 200),
        shipping_carrier: (body.shipping_carrier || '').slice(0, 60),
        shipping_service: (body.shipping_service || '').slice(0, 60),
      },
    })

    return NextResponse.json({
      client_secret: intent.client_secret,
      total_cents: totalCents,
    })
  } catch (err) {
    logError('merch.payment_intent.failed', err, {
      org_slug: orgSlug,
      product_id: productId,
    })
    return NextResponse.json(
      { error: 'Could not start payment.' },
      { status: 502 },
    )
  }
}
