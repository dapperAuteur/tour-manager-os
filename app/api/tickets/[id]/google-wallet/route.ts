import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyTicketSignature } from '@/lib/tickets/sign'
import {
  buildGoogleWalletSaveUrl,
  isGoogleWalletConfigured,
} from '@/lib/wallet/google-wallet'

/**
 * GET /api/tickets/[id]/google-wallet?token=<signature>
 *
 * Builds a Save-to-Google-Wallet JWT and redirects the fan to the
 * Google "Add to Wallet" prompt. Same auth model as the Apple
 * Wallet route: anyone with the ticket id plus the HMAC token can
 * download the pass.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: ticketId } = await params
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!isGoogleWalletConfigured()) {
    return NextResponse.json(
      {
        error:
          'Google Wallet not configured. Set the four GOOGLE_WALLET_* env vars.',
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
      `id, signature, issued_at, status, purchaser_name,
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

  try {
    const saveUrl = buildGoogleWalletSaveUrl({
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
    })
    return NextResponse.redirect(saveUrl, 302)
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Could not build Google Wallet pass.',
      },
      { status: 500 },
    )
  }
}
