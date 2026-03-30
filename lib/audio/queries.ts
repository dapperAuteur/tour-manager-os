import { createClient } from '@/lib/supabase/server'

export async function getSharedAudio(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shared_audio')
    .select('*, audio_comments(count), user_profiles:uploaded_by(display_name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
