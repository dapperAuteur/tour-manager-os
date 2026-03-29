import { createClient } from '@/lib/supabase/server'

export async function getItineraryForTour(tourId: string) {
  const supabase = await createClient()

  // Get all shows with advance sheet data for this tour
  const { data: shows, error } = await supabase
    .from('shows')
    .select(`
      *,
      advance_sheets(
        *,
        advance_contacts(*),
        advance_other_artists(*)
      )
    `)
    .eq('tour_id', tourId)
    .order('date', { ascending: true })

  if (error) throw error

  // Get any manually created itinerary days
  const { data: itineraryDays } = await supabase
    .from('itinerary_days')
    .select('*, schedule_items(*), flights(*)')
    .eq('tour_id', tourId)
    .order('date', { ascending: true })

  // Get tour info
  const { data: tour } = await supabase
    .from('tours')
    .select('name, artist_name')
    .eq('id', tourId)
    .single()

  return { shows: shows || [], itineraryDays: itineraryDays || [], tour }
}
