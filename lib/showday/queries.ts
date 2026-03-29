import { createClient } from '@/lib/supabase/server'

export interface ShowDayData {
  show: {
    id: string
    date: string
    city: string
    state: string | null
    venue_name: string | null
    timezone: string
    tour_id: string
    tours: { name: string; artist_name: string } | null
  }
  advance: {
    venue_address: string | null
    venue_phone: string | null
    venue_capacity: number | null
    soundcheck_time: string | null
    doors_time: string | null
    stage_time: string | null
    curfew_time: string | null
    performance_length_minutes: number | null
    stage_width: number | null
    stage_depth: number | null
    caterer_name: string | null
    meal_times: string | null
    merch_area_description: string | null
    sound_company_name: string | null
    sound_company_phone: string | null
    dressing_room_count: number | null
    dressing_room_location: string | null
    smoking_allowed: boolean | null
  } | null
  contacts: {
    id: string
    role: string
    contact_name: string | null
    phone: string | null
    company_name: string | null
  }[]
  itinerary: {
    hotel_name: string | null
    hotel_address: string | null
    hotel_phone: string | null
    hotel_confirmation: string | null
    hotel_amenities: string | null
    bus_call_time: string | null
    driver_name: string | null
    driver_phone: string | null
    distance_miles: number | null
    depart_time: string | null
    next_destination: string | null
  } | null
  prevShow: { city: string; state: string | null } | null
  nextShow: { city: string; state: string | null; date: string } | null
}

export async function getShowDayForDate(dateStr: string): Promise<ShowDayData | null> {
  const supabase = await createClient()

  // Find show on this date for any tour the user belongs to
  const { data: show } = await supabase
    .from('shows')
    .select('id, date, city, state, venue_name, timezone, tour_id, tours(name, artist_name)')
    .eq('date', dateStr)
    .limit(1)
    .single()

  if (!show) return null

  // Get advance sheet
  const { data: advanceData } = await supabase
    .from('advance_sheets')
    .select('*, advance_contacts(*)')
    .eq('show_id', show.id)
    .single()

  // Get itinerary day
  const { data: itinerary } = await supabase
    .from('itinerary_days')
    .select('*')
    .eq('show_id', show.id)
    .single()

  // Get prev/next shows in this tour
  const { data: prevShow } = await supabase
    .from('shows')
    .select('city, state')
    .eq('tour_id', show.tour_id)
    .lt('date', dateStr)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const { data: nextShow } = await supabase
    .from('shows')
    .select('city, state, date')
    .eq('tour_id', show.tour_id)
    .gt('date', dateStr)
    .order('date', { ascending: true })
    .limit(1)
    .single()

  return {
    show: show as unknown as ShowDayData['show'],
    advance: advanceData as unknown as ShowDayData['advance'],
    contacts: (advanceData?.advance_contacts || []) as unknown as ShowDayData['contacts'],
    itinerary: itinerary as unknown as ShowDayData['itinerary'],
    prevShow,
    nextShow,
  }
}

export async function getUserTourDates() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('shows')
    .select('date, city, state, venue_name')
    .order('date', { ascending: true })

  return data || []
}
