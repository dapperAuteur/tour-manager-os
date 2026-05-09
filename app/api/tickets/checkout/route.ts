import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_QTY = 20

interface CheckoutRequest {
  show_id: string
  ticket_type_id: string
  qty: number
  purchaser_email?: string
  purchaser_name?: string
}

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey === 'your-stripe-secret-key') {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 },
    )
  }

  let body: CheckoutRequest
  try {
    body = (await request.json()) as CheckoutRequest
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const { show_id, ticket_type_id, qty } = body
  if (
    typeof show_id !== 'string' ||
    typeof ticket_type_id !== 'string' ||
    typeof qty !== 'number' ||
    !Number.isInteger(qty) ||
    qty < 1 ||
    qty > MAX_QTY
  ) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const purchaserEmail = body.purchaser_email || user?.email
  const purchaserName =
    body.purchaser_name ||
    (user?.user_metadata?.display_name as string | undefined) ||
    null

  if (!purchaserEmail) {
    return NextResponse.json(
      { error: 'purchaser_email required for guest checkout' },
      { status: 400 },
    )
  }

  // Use admin client for inventory check so RLS doesn't filter rows for
  // logged-out fans browsing public ticket pages.
  const admin = createAdminClient()

  const { data: ticketType, error: ttErr } = await admin
    .from('ticket_types')
    .select('id, show_id, name, category, price, quantity_available, quantity_sold, active')
    .eq('id', ticket_type_id)
    .eq('show_id', show_id)
    .maybeSingle()

  if (ttErr || !ticketType) {
    return NextResponse.json({ error: 'ticket type not found' }, { status: 404 })
  }
  if (!ticketType.active) {
    return NextResponse.json({ error: 'ticket type not on sale' }, { status: 410 })
  }
  if (
    ticketType.quantity_available !== null &&
    ticketType.quantity_sold + qty > ticketType.quantity_available
  ) {
    return NextResponse.json({ error: 'sold out' }, { status: 409 })
  }
  if (Number(ticketType.price) <= 0) {
    return NextResponse.json(
      { error: 'comp tickets cannot be sold via checkout' },
      { status: 400 },
    )
  }

  const { data: show, error: showErr } = await admin
    .from('shows')
    .select('id, city, state, date, venue_name, tour_id, tours(name, artist_name)')
    .eq('id', show_id)
    .maybeSingle()

  if (showErr || !show) {
    return NextResponse.json({ error: 'show not found' }, { status: 404 })
  }

  const stripe = new Stripe(stripeKey)
  const origin = new URL(request.url).origin
  const tour = Array.isArray(show.tours) ? show.tours[0] : show.tours
  const artistName = tour?.artist_name || tour?.name || 'Tour Manager OS'
  const venue = show.venue_name || `${show.city}${show.state ? ', ' + show.state : ''}`
  const productName = `${artistName} — ${venue} (${show.date})`

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: qty,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(Number(ticketType.price) * 100),
          product_data: {
            name: `${ticketType.name} — ${productName}`,
            description: ticketType.category.toUpperCase(),
          },
        },
      },
    ],
    customer_email: purchaserEmail,
    success_url: `${origin}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shows/${show_id}/tickets?cancelled=true`,
    metadata: {
      kind: 'ticket',
      show_id,
      ticket_type_id,
      qty: String(qty),
      purchaser_user_id: user?.id || '',
      purchaser_email: purchaserEmail,
      purchaser_name: purchaserName || '',
    },
    payment_intent_data: {
      metadata: {
        kind: 'ticket',
        show_id,
        ticket_type_id,
        qty: String(qty),
      },
    },
  })

  if (!session.url) {
    return NextResponse.json({ error: 'failed to create session' }, { status: 500 })
  }

  return NextResponse.json({ url: session.url, session_id: session.id })
}
