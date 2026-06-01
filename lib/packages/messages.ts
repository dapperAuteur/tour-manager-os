import { createClient } from '@/lib/supabase/server'

export interface PackageMessage {
  id: string
  package_id: string
  sender_user_id: string | null
  sender_name: string | null
  sender_act_label: string | null
  body: string
  created_at: string
  edited_at: string | null
}

export async function listPackageMessages(
  packageId: string,
): Promise<PackageMessage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('package_messages')
    .select(
      'id, package_id, sender_user_id, sender_name, sender_act_label, body, created_at, edited_at',
    )
    .eq('package_id', packageId)
    .order('created_at', { ascending: true })
    .limit(500)
  if (error || !data) return []
  return data as PackageMessage[]
}

/**
 * Returns the package's acts that the current user can speak as — any
 * acts whose org they belong to. Empty list means they're either tour
 * staff or unaffiliated; the message form still lets them post,
 * labeled by their display name only.
 */
export async function getActsCurrentUserCanSpeakAs(
  packageId: string,
): Promise<{ id: string; act_name: string }[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: orgIds } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
  const orgIdList = (orgIds || []).map((r) => r.org_id).filter(Boolean)
  if (orgIdList.length === 0) return []

  const { data: acts } = await supabase
    .from('package_acts')
    .select('id, act_name')
    .eq('package_id', packageId)
    .in('org_id', orgIdList)
    .order('act_name')
  return (acts || []) as { id: string; act_name: string }[]
}
