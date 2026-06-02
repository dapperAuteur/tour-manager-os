import { createClient } from '@/lib/supabase/server'

export interface MapVenue {
  id: string
  name: string
  city: string
  state: string | null
  country: string | null
  venue_type: string | null
  capacity: number | null
  lat: number
  lng: number
  times_played: number
}

/**
 * Returns every venue with usable lat/lng. Capped at 1500 to keep
 * the initial bundle small — venues without coordinates fall back
 * to the directory list. The cap is intentionally above any plausible
 * roster a single band would tour through; if we ever cross it we
 * should switch to bbox-scoped fetches.
 */
export async function listMapVenues(): Promise<MapVenue[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('venue_profiles')
    .select(
      'id, name, city, state, country, venue_type, capacity, lat, lng, times_played',
    )
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('times_played', { ascending: false })
    .limit(1500)

  return (data || [])
    .filter(
      (v): v is MapVenue =>
        typeof v.lat === 'number' && typeof v.lng === 'number',
    )
    .map((v) => ({
      ...v,
      times_played: v.times_played ?? 0,
    }))
}
