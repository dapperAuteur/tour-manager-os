import { createClient } from '@/lib/supabase/server'

export async function getAllModules() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data
}

export async function getUserOrg(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('org_members')
    .select('*, organizations(*)')
    .eq('user_id', userId)
    .limit(1)
    .single()

  return data
}

export async function getOrgModules(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('org_modules')
    .select('*, modules(*)')
    .eq('org_id', orgId)
    .eq('enabled', true)

  if (error) throw error
  return data
}

export async function getMemberModuleAccess(userId: string, orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('member_module_access')
    .select('*')
    .eq('member_id', userId)
    .eq('org_id', orgId)

  if (error) throw error
  return data
}

export async function hasModuleAccess(userId: string, orgId: string, moduleId: string): Promise<boolean> {
  const supabase = await createClient()

  // Check org has module enabled
  const { data: orgMod } = await supabase
    .from('org_modules')
    .select('enabled')
    .eq('org_id', orgId)
    .eq('module_id', moduleId)
    .single()

  if (!orgMod?.enabled) return false

  // Check member has active access
  const { data: access } = await supabase
    .from('member_module_access')
    .select('status')
    .eq('member_id', userId)
    .eq('org_id', orgId)
    .eq('module_id', moduleId)
    .single()

  return access?.status === 'active'
}
