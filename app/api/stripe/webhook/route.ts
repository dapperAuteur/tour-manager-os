import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

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
