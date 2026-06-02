import { createAdminClient } from '@/lib/supabase/admin'

export interface PublicShowSummary {
  id: string
  date: string
  city: string
  state: string | null
  venue_name: string | null
  tour_name: string
  artist_name: string
  doors_time: string | null
  stage_time: string | null
  curfew_time: string | null
  ticket_price: number | null
  ticket_count_remaining: number
  ticket_count_total: number
  has_tickets_for_sale: boolean
  fan_photo_count: number
  has_setlist: boolean
  has_exclusive_content: boolean
}

/**
 * Fetches the consolidated public view of a show: artist + venue header,
 * advance-sheet times (if submitted), ticket availability summary, and
 * counts for fan photos / setlist so the page can render preview cards.
 *
 * Returns null when the show doesn't exist. Doesn't enforce any auth —
 * this is the fan-facing landing.
 */
export async function getPublicShow(
  showId: string,
): Promise<PublicShowSummary | null> {
  const admin = createAdminClient()

  const { data: show } = await admin
    .from('shows')
    .select(`
      id, date, city, state, venue_name,
      tours(name, artist_name),
      advance_sheets(doors_time, stage_time, curfew_time, ticket_price)
    `)
    .eq('id', showId)
    .maybeSingle()
  if (!show) return null

  const tour = show.tours as unknown as { name: string; artist_name: string } | null
  const sheet =
    (show.advance_sheets as unknown as Array<{
      doors_time: string | null
      stage_time: string | null
      curfew_time: string | null
      ticket_price: number | null
    }> | null)?.[0] || null

  const [ticketTypesRes, fanPhotosRes, setlistRes, exclusiveRes] = await Promise.all([
    admin
      .from('ticket_types')
      .select('quantity_available, quantity_sold, active')
      .eq('show_id', showId),
    admin
      .from('fan_photos')
      .select('id', { count: 'exact', head: true })
      .eq('show_id', showId)
      .eq('status', 'published'),
    admin
      .from('setlists')
      .select('id', { count: 'exact', head: true })
      .eq('show_id', showId)
      .limit(1),
    admin
      .from('show_exclusive_content')
      .select('id', { count: 'exact', head: true })
      .eq('show_id', showId)
      .eq('active', true),
  ])

  const ticketTypes = ticketTypesRes.data || []
  const ticket_count_total = ticketTypes.reduce(
    (s, t) => s + (t.quantity_available ?? 0),
    0,
  )
  const ticket_count_sold = ticketTypes.reduce(
    (s, t) => s + (t.quantity_sold ?? 0),
    0,
  )
  const ticket_count_remaining = Math.max(
    0,
    ticket_count_total - ticket_count_sold,
  )
  const has_tickets_for_sale = ticketTypes.some(
    (t) =>
      t.active === true &&
      ((t.quantity_available ?? 0) === 0 || ticket_count_remaining > 0),
  )

  return {
    id: show.id,
    date: show.date as string,
    city: show.city,
    state: show.state as string | null,
    venue_name: show.venue_name as string | null,
    tour_name: tour?.name || 'Tour',
    artist_name: tour?.artist_name || 'Artist',
    doors_time: sheet?.doors_time ?? null,
    stage_time: sheet?.stage_time ?? null,
    curfew_time: sheet?.curfew_time ?? null,
    ticket_price: sheet?.ticket_price ?? null,
    ticket_count_remaining,
    ticket_count_total,
    has_tickets_for_sale,
    fan_photo_count: fanPhotosRes.count ?? 0,
    has_setlist: (setlistRes.count ?? 0) > 0,
    has_exclusive_content: (exclusiveRes.count ?? 0) > 0,
  }
}

export async function listRecentPublishedFanPhotos(
  showId: string,
  limit = 6,
): Promise<{ id: string; cloudinary_url: string; caption: string | null }[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('fan_photos')
    .select('id, cloudinary_url, caption')
    .eq('show_id', showId)
    .eq('status', 'published')
    .order('submitted_at', { ascending: false })
    .limit(limit)
  return (data || []) as {
    id: string
    cloudinary_url: string
    caption: string | null
  }[]
}
