import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type Tour = Database['public']['Tables']['tours']['Row']
type TourMember = Database['public']['Tables']['tour_members']['Row']
type Show = Database['public']['Tables']['shows']['Row']
type AdvanceSheet = Database['public']['Tables']['advance_sheets']['Row']
type AdvanceContact = Database['public']['Tables']['advance_contacts']['Row']
type AdvanceOtherArtist = Database['public']['Tables']['advance_other_artists']['Row']

export type TourWithRelations = Tour & {
  tour_members: TourMember[]
  shows: (Show & {
    advance_sheets: Pick<AdvanceSheet, 'id' | 'status' | 'token'>[]
  })[]
}

export type ShowWithRelations = Show & {
  advance_sheets: (AdvanceSheet & {
    advance_contacts: AdvanceContact[]
    advance_other_artists: AdvanceOtherArtist[]
  })[]
}

export async function getTours() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tours')
    .select('*, tour_members(*), shows(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (Tour & { tour_members: TourMember[]; shows: Show[] })[]
}

export async function getTour(tourId: string): Promise<TourWithRelations> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tours')
    .select('*, tour_members(*), shows(*, advance_sheets(id, status, token))')
    .eq('id', tourId)
    .single()

  if (error) throw error
  return data as unknown as TourWithRelations
}

export async function getShow(showId: string): Promise<ShowWithRelations> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shows')
    .select(`
      *,
      advance_sheets(
        *,
        advance_contacts(*),
        advance_other_artists(*)
      )
    `)
    .eq('id', showId)
    .single()

  if (error) throw error
  return data as unknown as ShowWithRelations
}

export async function getAdvanceSheetByToken(token: string) {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('advance_sheets')
    .select(`
      *,
      advance_contacts(*),
      advance_other_artists(*),
      shows(date, city, state, venue_name, tours(name, artist_name))
    `)
    .eq('token', token)
    .single()

  if (error) throw error
  return data as unknown as AdvanceSheet & {
    advance_contacts: AdvanceContact[]
    advance_other_artists: AdvanceOtherArtist[]
    shows: Pick<Show, 'date' | 'city' | 'state' | 'venue_name'> & {
      tours: Pick<Tour, 'name' | 'artist_name'>
    }
  }
}
