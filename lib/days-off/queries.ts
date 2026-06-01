import { createClient } from '@/lib/supabase/server'

export interface DayOffPlan {
  id: string
  tour_id: string
  date: string
  member_user_id: string | null
  member_name: string | null
  activity_type: 'rest' | 'sightseeing' | 'gym' | 'spa' | 'food' | 'family' | 'errands' | 'other'
  title: string
  description: string | null
  location_name: string | null
  location_url: string | null
  status: 'planned' | 'done' | 'skipped'
  created_by: string | null
  created_at: string
}

export interface DayOffSlot {
  date: string
  /** City you'll be in (or near) based on the previous show, when known. */
  city: string | null
  state: string | null
  plans: DayOffPlan[]
}

/**
 * Computes the off-days for a tour by diffing the tour date range
 * against scheduled shows, then attaches any existing plans for
 * each off-day. Carries forward the previous show's city so the
 * suggestion links know where the band will be.
 */
export async function listOffDaysForTour(
  tourId: string,
): Promise<DayOffSlot[]> {
  const supabase = await createClient()

  const { data: tour } = await supabase
    .from('tours')
    .select('id, start_date, end_date')
    .eq('id', tourId)
    .maybeSingle()
  if (!tour?.start_date || !tour?.end_date) return []

  const { data: shows } = await supabase
    .from('shows')
    .select('date, city, state')
    .eq('tour_id', tourId)
    .order('date')
  const showDates = new Map<string, { city: string; state: string | null }>()
  for (const s of shows || []) {
    showDates.set(s.date as string, {
      city: s.city as string,
      state: (s.state as string | null) ?? null,
    })
  }

  const { data: plansRaw } = await supabase
    .from('day_off_plans')
    .select(
      `id, tour_id, date, member_user_id, activity_type, title, description, location_name, location_url, status, created_by, created_at,
       user_profiles:member_user_id(display_name)`,
    )
    .eq('tour_id', tourId)
    .order('date')
    .order('created_at')

  const plans: DayOffPlan[] = (plansRaw || []).map((p) => ({
    id: p.id,
    tour_id: p.tour_id,
    date: p.date,
    member_user_id: p.member_user_id,
    member_name:
      (p.user_profiles as unknown as { display_name: string | null } | null)
        ?.display_name ?? null,
    activity_type: p.activity_type as DayOffPlan['activity_type'],
    title: p.title,
    description: p.description,
    location_name: p.location_name,
    location_url: p.location_url,
    status: p.status as DayOffPlan['status'],
    created_by: p.created_by,
    created_at: p.created_at,
  }))

  // Iterate days in the tour range. Off-day = no show on that date.
  const slots: DayOffSlot[] = []
  let lastCity: string | null = null
  let lastState: string | null = null
  const start = new Date(tour.start_date as string)
  const end = new Date(tour.end_date as string)
  for (let t = start.getTime(); t <= end.getTime(); t += 86400000) {
    const day = new Date(t).toISOString().slice(0, 10)
    const showOn = showDates.get(day)
    if (showOn) {
      lastCity = showOn.city
      lastState = showOn.state
      continue
    }
    slots.push({
      date: day,
      city: lastCity,
      state: lastState,
      plans: plans.filter((p) => p.date === day),
    })
  }
  return slots
}

/**
 * Google Maps search deep-links keyed by activity type. The band
 * doesn't need a curated database of gyms — just a quick path to
 * a discovery page. City is appended when available.
 */
export function suggestionLinks(
  city: string | null,
  state: string | null,
): { label: string; href: string; activity: DayOffPlan['activity_type'] }[] {
  const where = city
    ? encodeURIComponent(`${city}${state ? ', ' + state : ''}`)
    : ''
  const base = (q: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}${where ? `+${where}` : ''}`

  return [
    { label: 'Nearby gyms', href: base('day pass gym'), activity: 'gym' },
    { label: 'Spas & saunas', href: base('spa sauna'), activity: 'spa' },
    { label: 'Walking parks', href: base('park walking trail'), activity: 'sightseeing' },
    { label: 'Local food', href: base('local food highly rated'), activity: 'food' },
    { label: 'Laundromats', href: base('laundromat'), activity: 'errands' },
    { label: 'Family-friendly', href: base('family attractions'), activity: 'family' },
  ]
}
