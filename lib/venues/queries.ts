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

  // Calculate averages
  const allRatings = ratings || []
  const avgOverall = allRatings.length > 0
    ? allRatings.reduce((sum, r) => sum + r.overall_rating, 0) / allRatings.length
    : 0

  return {
    venue,
    ratings: allRatings,
    notes: notes || [],
    avgRating: Math.round(avgOverall * 10) / 10,
    ratingCount: allRatings.length,
  }
}
