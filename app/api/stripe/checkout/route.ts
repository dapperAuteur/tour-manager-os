import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  // Stripe checkout will be implemented when STRIPE_SECRET_KEY is configured.
  // For now, return a placeholder response.
  const priceId = type === 'lifetime'
    ? process.env.STRIPE_LIFETIME_PRICE_ID
    : process.env.STRIPE_ANNUAL_PRICE_ID

  if (!priceId || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'your-stripe-secret-key') {
    return NextResponse.json({
      error: 'Stripe is not configured yet. Set STRIPE_SECRET_KEY, STRIPE_LIFETIME_PRICE_ID, and STRIPE_ANNUAL_PRICE_ID in your environment variables.',
      type,
    }, { status: 503 })
  }

  // TODO: Create Stripe Checkout session and redirect
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  // const session = await stripe.checkout.sessions.create({ ... })
  // return NextResponse.redirect(session.url)

  return NextResponse.json({ message: 'Stripe checkout coming soon', type, priceId })
}
