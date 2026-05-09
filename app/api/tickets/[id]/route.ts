import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildQrPayload } from '@/lib/tickets/sign'

interface RouteContext {
  params: Promise<{ id: string }>
}

function tokenMatches(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  // Look up the ticket via admin client. Authorization is enforced below
  // (purchaser_user_id match OR token match) — RLS would block guest checkout
  // since purchaser_user_id can be null.
  const admin = createAdminClient()
  const { data: ticket, error } = await admin
    .from('tickets')
    .select(
      `id, ticket_type_id, show_id, purchaser_user_id, purchaser_email,
       purchaser_name, status, signature, issued_at, used_at,
       ticket_types(name, category, price),
       shows(date, city, state, venue_name, tour_id, tours(name, artist_name))`,
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !ticket) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  let authorized = false
  if (token && tokenMatches(token, ticket.signature)) {
    authorized = true
  } else if (ticket.purchaser_user_id) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.id === ticket.purchaser_user_id) authorized = true
  }

  if (!authorized) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  type EmbeddedTour = { name: string | null; artist_name: string | null }
  type EmbeddedShow = {
    date: string
    city: string
    state: string | null
    venue_name: string | null
    tours: EmbeddedTour | EmbeddedTour[] | null
  }
  type EmbeddedTicketType = {
    name: string
    category: string
    price: number
  }
  const raw = ticket as unknown as {
    ticket_types: EmbeddedTicketType | EmbeddedTicketType[] | null
    shows: EmbeddedShow | EmbeddedShow[] | null
  }
  const ticketType = Array.isArray(raw.ticket_types)
    ? raw.ticket_types[0]
    : raw.ticket_types
  const show = Array.isArray(raw.shows) ? raw.shows[0] : raw.shows
  const tour = show
    ? Array.isArray(show.tours) ? show.tours[0] : show.tours
    : null

  const qrPayload = buildQrPayload(
    { id: ticket.id, show_id: ticket.show_id, issued_at: ticket.issued_at },
    ticket.signature,
  )

  return NextResponse.json({
    id: ticket.id,
    status: ticket.status,
    issued_at: ticket.issued_at,
    used_at: ticket.used_at,
    purchaser_email: ticket.purchaser_email,
    purchaser_name: ticket.purchaser_name,
    ticket_type: ticketType
      ? {
          name: ticketType.name,
          category: ticketType.category,
          price: ticketType.price,
        }
      : null,
    show: show
      ? {
          date: show.date,
          city: show.city,
          state: show.state,
          venue_name: show.venue_name,
          artist_name: tour?.artist_name || tour?.name || null,
        }
      : null,
    qr_payload: qrPayload,
  })
}
