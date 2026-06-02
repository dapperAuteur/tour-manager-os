import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  buildTicketPkpass,
  isApplePkpassConfigured,
} from '@/lib/wallet/apple-pkpass'
import { verifyTicketSignature } from '@/lib/tickets/sign'

/**
 * GET /api/tickets/[id]/pkpass?token=<signature>
 *
 * Returns a signed Apple Wallet pass (.pkpass) for the given ticket
 * when the token matches the stored signature. Anonymous-friendly so
 * the link in the purchase email opens straight into Wallet.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: ticketId } = await params
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!isApplePkpassConfigured()) {
    return NextResponse.json(
      {
        error:
          'Apple Wallet not configured on this platform. The team needs to install the Pass Type ID cert + WWDR cert and set PKPASS_* env vars.',
      },
      { status: 503 },
    )
  }
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: ticket } = await admin
    .from('tickets')
    .select(
      `id, signature, issued_at, status, purchaser_email, purchaser_name,
       show_id, ticket_types:ticket_type_id(name),
       shows:show_id(date, city, state, venue_name,
         tours:tour_id(name, artist_name),
         advance_sheets(doors_time, stage_time, venue_address))`,
    )
    .eq('id', ticketId)
    .maybeSingle()

  if (!ticket) {
    return NextResponse.json({ error: 'ticket not found' }, { status: 404 })
  }

  if (
    !verifyTicketSignature(
      { id: ticket.id, show_id: ticket.show_id, issued_at: ticket.issued_at },
      token,
    )
  ) {
    return NextResponse.json({ error: 'invalid token' }, { status: 403 })
  }

  if (ticket.status === 'refunded' || ticket.status === 'void') {
    return NextResponse.json(
      { error: `ticket ${ticket.status}` },
      { status: 410 },
    )
  }

  const show = ticket.shows as unknown as
    | {
        date: string
        city: string | null
        state: string | null
        venue_name: string | null
        tours: { name: string; artist_name: string } | null
        advance_sheets:
          | Array<{
              doors_time: string | null
              stage_time: string | null
              venue_address: string | null
            }>
          | null
      }
    | null
  const ticketType = ticket.ticket_types as unknown as { name: string } | null
  const sheet = show?.advance_sheets?.[0] ?? null
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin

  try {
    const buffer = await buildTicketPkpass({
      ticketId: ticket.id,
      signature: ticket.signature,
      showId: ticket.show_id,
      showDate: show?.date ?? '',
      showTime: sheet?.doors_time ?? sheet?.stage_time ?? null,
      artistName:
        show?.tours?.artist_name || show?.tours?.name || 'Tour Manager OS',
      venueName:
        show?.venue_name ||
        `${show?.city ?? ''}${show?.state ? ', ' + show.state : ''}` ||
        'Venue',
      venueAddress: sheet?.venue_address ?? null,
      ticketTypeName: ticketType?.name ?? 'Admission',
      purchaserName: ticket.purchaser_name ?? null,
      purchaserEmail: ticket.purchaser_email ?? null,
      scanUrl: `${origin}/tickets/${ticket.id}?token=${encodeURIComponent(ticket.signature)}`,
    })
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="ticket-${ticket.id.slice(0, 8)}.pkpass"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Could not build Apple Wallet pass.',
      },
      { status: 500 },
    )
  }
}
