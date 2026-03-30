'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function rateVenue(venueId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!orgMember) return { error: 'Join an organization first' }

  const { error } = await supabase.from('venue_ratings').upsert({
    venue_id: venueId,
    org_id: orgMember.org_id,
    user_id: user.id,
    overall_rating: Number(formData.get('overall_rating')),
    sound_rating: Number(formData.get('sound_rating')) || null,
    hospitality_rating: Number(formData.get('hospitality_rating')) || null,
    load_in_rating: Number(formData.get('load_in_rating')) || null,
    dressing_room_rating: Number(formData.get('dressing_room_rating')) || null,
    review: (formData.get('review') as string) || null,
    show_date: (formData.get('show_date') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/venues/${venueId}`)
  return { success: true }
}

export async function createVenueFromAdvanceSheet(advanceSheetId: string) {
  const supabase = await createClient()

  const { data: sheet } = await supabase
    .from('advance_sheets')
    .select('*, shows(venue_name, city, state, country)')
    .eq('id', advanceSheetId)
    .single()

  if (!sheet) return { error: 'Advance sheet not found' }

  const show = sheet.shows as { venue_name: string | null; city: string; state: string | null; country: string | null }

  const { data: existing } = await supabase
    .from('venue_profiles')
    .select('id')
    .ilike('name', show.venue_name || '')
    .eq('city', show.city)
    .limit(1)
    .single()

  if (existing) {
    // Update existing
    await supabase.from('venue_profiles').update({
      venue_type: sheet.venue_type || undefined,
      capacity: sheet.venue_capacity || undefined,
      address: sheet.venue_address || undefined,
      phone: sheet.venue_phone || undefined,
      stage_width: sheet.stage_width || undefined,
      stage_depth: sheet.stage_depth || undefined,
      stage_height: sheet.stage_height || undefined,
      pa_system: sheet.pa_system || undefined,
      has_stage_door: sheet.has_stage_door ?? undefined,
      has_rear_door: sheet.has_rear_door ?? undefined,
      has_backstage_parking: sheet.has_backstage_parking ?? undefined,
      dressing_room_count: sheet.dressing_room_count || undefined,
      times_played: (existing as { times_played?: number }).times_played ? undefined : 1,
      last_played_at: show.venue_name ? new Date().toISOString().split('T')[0] : undefined,
    }).eq('id', existing.id)

    return { success: true, venueId: existing.id, updated: true }
  }

  // Create new
  const { data: venue, error } = await supabase.from('venue_profiles').insert({
    name: show.venue_name || 'Unknown Venue',
    city: show.city,
    state: show.state,
    country: show.country || 'US',
    address: sheet.venue_address,
    phone: sheet.venue_phone,
    venue_type: sheet.venue_type,
    capacity: sheet.venue_capacity,
    stage_width: sheet.stage_width,
    stage_depth: sheet.stage_depth,
    stage_height: sheet.stage_height,
    pa_system: sheet.pa_system,
    has_stage_door: sheet.has_stage_door,
    has_rear_door: sheet.has_rear_door,
    has_backstage_parking: sheet.has_backstage_parking,
    dressing_room_count: sheet.dressing_room_count,
    times_played: 1,
    last_played_at: new Date().toISOString().split('T')[0],
    created_from_advance_sheet: advanceSheetId,
  }).select('id').single()

  if (error) return { error: error.message }
  return { success: true, venueId: venue.id, created: true }
}
