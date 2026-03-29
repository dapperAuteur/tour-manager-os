import { createClient } from '@/lib/supabase/server'

export async function getPolls(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('polls')
    .select('*, poll_options(*, poll_votes(count)), user_profiles:created_by(display_name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserVotes(pollId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('poll_votes')
    .select('option_id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)

  return new Set((data || []).map((v) => v.option_id))
}

export async function getPracticeSessions(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*, practice_rsvps(user_id, status, user_profiles:user_id(display_name))')
    .eq('org_id', orgId)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getSharedAlbums(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shared_albums')
    .select('*, album_media(count), tours(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAlbumWithMedia(albumId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shared_albums')
    .select('*, album_media(*, user_profiles:uploaded_by(display_name)), tours(name)')
    .eq('id', albumId)
    .single()

  if (error) throw error
  return data
}
