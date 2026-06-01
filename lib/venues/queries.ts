import { createClient } from '@/lib/supabase/server'

export async function searchVenues(query?: string, venueType?: string) {
  const supabase = await createClient()

  if (query && query.trim()) {
    const { data } = await supabase.rpc('search_venues', {
      query: query.trim(),
      venue_type_filter: venueType || null,
    })
    return (data || []) as { id: string; name: string; city: string; state: string | null; venue_type: string | null; capacity: number | null; times_played: number }[]
  }

  let q = supabase
    .from('venue_profiles')
    .select('id, name, city, state, venue_type, capacity, times_played')
    .order('times_played', { ascending: false })
    .limit(50)

  if (venueType) q = q.eq('venue_type', venueType)

  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getVenueProfile(venueId: string) {
  const supabase = await createClient()

  const { data: venue, error } = await supabase
    .from('venue_profiles')
    .select('*')
    .eq('id', venueId)
    .single()

  if (error) throw error

  const { data: ratings } = await supabase
    .from('venue_ratings')
    .select('*, user_profiles:user_id(display_name)')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })

  // Get venue notes
  const { data: notes } = await supabase
    .from('venue_notes')
    .select('*, user_profiles:created_by(display_name)')
    .ilike('venue_name', venue.name)
    .order('updated_at', { ascending: false })

  // Get venue contacts (booker, sound, hospitality, etc.). Primary
  // contacts surface first per role. Filter through the
  // user_can_see_contact() helper so contacts gated to specific groups
  // disappear for members who shouldn't see them.
  const { data: contactsRaw } = await supabase
    .from('venue_contacts')
    .select('*')
    .eq('venue_id', venueId)
    .order('is_primary', { ascending: false })
    .order('role')
    .order('name')

  // Step 1 — apply visibility filter: contacts gated to groups the
  // viewer can't see disappear. Empty groups = visible to everyone.
  const contactIds = (contactsRaw || []).map((c) => c.id)
  let visibleIds = new Set<string>(contactIds)
  if (contactIds.length > 0) {
    const { data: visibleRows } = await supabase
      .rpc('filter_visible_contacts', { contact_ids: contactIds })
    if (Array.isArray(visibleRows)) {
      visibleIds = new Set(
        (visibleRows as { id: string }[]).map((r) => r.id),
      )
    }
  }
  const contacts = (contactsRaw || []).filter((c) => visibleIds.has(c.id))

  // Step 2 — career history: for each visible contact, look up the
  // same person (email/phone match) at OTHER venues. Surfaces "this
  // booker is now at X" without a `people` registry.
  const { getContactHistory } = await import('./contact-history')
  const contactHistory = await getContactHistory(
    contacts.map((c) => ({ id: c.id, email: c.email, phone: c.phone })),
    venueId,
  )
  const history: Record<string, Awaited<ReturnType<typeof getContactHistory>> extends Map<string, infer V> ? V : never> = {}
  for (const [id, entries] of contactHistory.entries()) history[id] = entries

  // Multi-stage venues — list of named stages with explicit
  // indoor/outdoor/tent location.
  const { data: stages } = await supabase
    .from('venue_stages')
    .select('id, name, location, capacity, stage_width, stage_depth, stage_height, pa_system, notes')
    .eq('venue_id', venueId)
    .order('name')

  // Calculate averages
  const allRatings = ratings || []
  const avgOverall = allRatings.length > 0
    ? allRatings.reduce((sum, r) => sum + r.overall_rating, 0) / allRatings.length
    : 0

  return {
    venue,
    ratings: allRatings,
    notes: notes || [],
    contacts: contacts || [],
    contactHistory: history,
    stages: stages || [],
    avgRating: Math.round(avgOverall * 10) / 10,
    ratingCount: allRatings.length,
  }
}
