import { createClient } from '@/lib/supabase/server'

export interface ContactGroup {
  id: string
  org_id: string
  name: string
  description: string | null
  created_by: string | null
  member_count: number
  visibility_count: number
}

export interface ContactGroupDetail extends ContactGroup {
  members: {
    contact_id: string
    name: string
    role: string
    venue_id: string
    venue_name: string
  }[]
  visibility: {
    user_id: string
    display_name: string | null
  }[]
  is_creator: boolean
  is_org_admin: boolean
}

export async function getOrgIdForCurrentUser(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  return data?.org_id ?? null
}

export async function listContactGroups(): Promise<ContactGroup[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_groups')
    .select('id, org_id, name, description, created_by, contact_group_members(count), contact_group_visibility(count)')
    .order('name')
  if (error || !data) return []
  return data.map((g) => ({
    id: g.id,
    org_id: g.org_id,
    name: g.name,
    description: g.description,
    created_by: g.created_by,
    member_count:
      (g.contact_group_members as { count: number }[] | null)?.[0]?.count ?? 0,
    visibility_count:
      (g.contact_group_visibility as { count: number }[] | null)?.[0]?.count ?? 0,
  }))
}

export async function getContactGroup(
  groupId: string,
): Promise<ContactGroupDetail | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: group, error } = await supabase
    .from('contact_groups')
    .select('id, org_id, name, description, created_by')
    .eq('id', groupId)
    .maybeSingle()
  if (error || !group) return null

  const { data: members } = await supabase
    .from('contact_group_members')
    .select('contact_id, venue_contacts(name, role, venue_id, venue_profiles(name))')
    .eq('group_id', groupId)
  const { data: visibility } = await supabase
    .from('contact_group_visibility')
    .select('user_id, user_profiles:user_id(display_name)')
    .eq('group_id', groupId)

  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('org_id', group.org_id)
    .maybeSingle()
  const isOrgAdmin =
    membership?.role === 'owner' || membership?.role === 'admin'

  return {
    id: group.id,
    org_id: group.org_id,
    name: group.name,
    description: group.description,
    created_by: group.created_by,
    is_creator: group.created_by === user.id,
    is_org_admin: isOrgAdmin,
    member_count: members?.length ?? 0,
    visibility_count: visibility?.length ?? 0,
    members: (members || []).map((row) => {
      const c = row.venue_contacts as unknown as
        | {
            name: string
            role: string
            venue_id: string
            venue_profiles: { name: string } | null
          }
        | null
      return {
        contact_id: row.contact_id,
        name: c?.name || 'Unknown',
        role: c?.role || 'other',
        venue_id: c?.venue_id || '',
        venue_name: c?.venue_profiles?.name || 'Unknown venue',
      }
    }),
    visibility: (visibility || []).map((row) => ({
      user_id: row.user_id,
      display_name:
        (row.user_profiles as unknown as { display_name: string | null } | null)
          ?.display_name ?? null,
    })),
  }
}

export async function listOrgMembers(
  orgId: string,
): Promise<{ user_id: string; display_name: string | null; email: string | null }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('org_members')
    .select('user_id, user_profiles:user_id(display_name)')
    .eq('org_id', orgId)
  return (data || []).map((row) => ({
    user_id: row.user_id,
    display_name:
      (row.user_profiles as unknown as { display_name: string | null } | null)
        ?.display_name ?? null,
    email: null,
  }))
}
