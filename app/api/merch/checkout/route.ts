import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/observability/logger'

/**
 * Creates a Stripe Checkout session for a merch product. Public route —
 * fans don't need an account. Validates that the product exists, is
 * active, belongs to the requested org, and uses the admin client to
 * read the catalog without RLS friction.
 */
export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey === 'your-stripe-secret-key') {
    return NextResponse.json(
      { error: 'Stripe is not configured.' },
      { status: 503 },
    )
  }

  let body: { product_id?: string; quantity?: number; org_slug?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const productId = body.product_id?.trim()
  const orgSlug = body.org_slug?.trim()
  const quantity = Math.min(Math.max(Number(body.quantity || 1), 1), 10)
  if (!productId || !orgSlug) {
    return NextResponse.json(
      { error: 'product_id and org_slug are required.' },
      { status: 400 },
    )
  }

  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .maybeSingle()
  if (!org) {
    return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
  }

  const { data: product } = await admin
    .from('merch_products')
    .select('id, name, description, price, image_url, active, org_id')
    .eq('id', productId)
    .eq('org_id', org.id)
    .maybeSingle()
  if (!product || !product.active) {
    return NextResponse.json(
      { error: 'Product not available.' },
      { status: 404 },
    )
  }

  const unitAmount = Math.round(Number(product.price) * 100)
  if (!Number.isFinite(unitAmount) || unitAmount < 50) {
    return NextResponse.json(
      { error: 'Product price is invalid for Stripe.' },
      { status: 400 },
    )
  }

  const stripe = new Stripe(stripeKey)
  const origin = request.headers.get('origin') || 'https://tour.witus.online'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'IE', 'DE', 'FR', 'NL', 'ES', 'IT', 'SE', 'JP'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Standard shipping (5-10 business days)',
            type: 'fixed_amount',
            fixed_amount: { amount: 599, currency: 'usd' },
          },
        },
      ],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmount,
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.image_url ? [product.image_url] : undefined,
            },
          },
          quantity,
        },
      ],
      success_url: `${origin}/store/${orgSlug}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store/${orgSlug}`,
      metadata: {
        kind: 'merch',
        org_id: org.id,
        org_slug: orgSlug,
        product_id: product.id,
        quantity: String(quantity),
        product_name: product.name,
      },
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    logError('merch.checkout.create_failed', err, {
      org_slug: orgSlug,
      product_id: productId,
    })
    return NextResponse.json(
      { error: 'Could not start checkout.' },
      { status: 502 },
    )
  }
}
