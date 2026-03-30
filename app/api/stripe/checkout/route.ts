import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as 'lifetime' | 'annual'
  const promoCode = searchParams.get('promo')

  if (!type || !['lifetime', 'annual'].includes(type)) {
    return NextResponse.json({ error: 'Invalid subscription type' }, { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const lifetimePriceId = process.env.STRIPE_LIFETIME_PRICE_ID
  const annualPriceId = process.env.STRIPE_ANNUAL_PRICE_ID

  if (!stripeKey || stripeKey === 'your-stripe-secret-key') {
    return NextResponse.json({
      error: 'Stripe is not configured. See the admin setup guide for instructions.',
      setup_url: '/help/stripe-setup',
    }, { status: 503 })
  }

  const priceId = type === 'lifetime' ? lifetimePriceId : annualPriceId
  if (!priceId) {
    return NextResponse.json({ error: `STRIPE_${type.toUpperCase()}_PRICE_ID not configured` }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login?redirect=/pricing', request.url))
  }

  const stripe = new Stripe(stripeKey)
  const origin = new URL(request.url).origin

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: type === 'lifetime' ? 'payment' : 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/pricing?success=true&type=${type}`,
    cancel_url: `${origin}/pricing?cancelled=true`,
    customer_email: user.email || undefined,
    metadata: {
      user_id: user.id,
      subscription_type: type,
    },
  }

  if (promoCode) {
    sessionParams.allow_promotion_codes = true
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  if (!session.url) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }

  return NextResponse.redirect(session.url)
}
