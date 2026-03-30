import { createClient } from '@/lib/supabase/server'

export async function getSetlistsForTour(tourId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('setlists')
    .select('*, setlist_songs(count), setlist_comments(count)')
    .eq('tour_id', tourId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getSetlistWithSongs(setlistId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('setlists')
    .select(`
      *,
      setlist_songs(*),
      setlist_comments(*, user_profiles:user_id(display_name))
    `)
    .eq('id', setlistId)
    .order('sort_order', { referencedTable: 'setlist_songs', ascending: true })
    .order('created_at', { referencedTable: 'setlist_comments', ascending: true })
    .single()

  if (error) throw error
  return data
}
