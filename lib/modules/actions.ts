'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleOrgModule(orgId: string, moduleId: string, enabled: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('org_modules')
    .upsert({
      org_id: orgId,
      module_id: moduleId,
      enabled,
      enabled_by: user.id,
      enabled_at: new Date().toISOString(),
    })

  if (error) return { error: error.message }

  revalidatePath('/admin/modules')
  revalidatePath('/modules')
  return { success: true }
}

export async function requestModuleAccess(orgId: string, moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('member_module_access')
    .upsert({
      member_id: user.id,
      org_id: orgId,
      module_id: moduleId,
      status: 'requested',
      requested_at: new Date().toISOString(),
    })

  if (error) return { error: error.message }

  revalidatePath('/modules')
  return { success: true }
}

export async function activateModule(orgId: string, moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check org has module enabled
  const { data: orgMod } = await supabase
    .from('org_modules')
    .select('enabled')
    .eq('org_id', orgId)
    .eq('module_id', moduleId)
    .single()

  if (!orgMod?.enabled) return { error: 'Module not available for this organization' }

  const { error } = await supabase
    .from('member_module_access')
    .upsert({
      member_id: user.id,
      org_id: orgId,
      module_id: moduleId,
      status: 'active',
      granted_by: user.id,
      granted_at: new Date().toISOString(),
    })

  if (error) return { error: error.message }

  revalidatePath('/modules')
  return { success: true }
}

export async function approveModuleRequest(memberId: string, orgId: string, moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('member_module_access')
    .update({
      status: 'active',
      granted_by: user.id,
      granted_at: new Date().toISOString(),
    })
    .eq('member_id', memberId)
    .eq('org_id', orgId)
    .eq('module_id', moduleId)

  if (error) return { error: error.message }

  revalidatePath('/admin/modules')
  return { success: true }
}

export async function revokeModuleAccess(memberId: string, orgId: string, moduleId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('member_module_access')
    .update({ status: 'revoked' })
    .eq('member_id', memberId)
    .eq('org_id', orgId)
    .eq('module_id', moduleId)

  if (error) return { error: error.message }

  revalidatePath('/admin/modules')
  return { success: true }
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  if (!name) return { error: 'Organization name is required' }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({ name, slug, created_by: user.id })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Add creator as owner
  await supabase.from('org_members').insert({
    org_id: org.id,
    user_id: user.id,
    role: 'owner',
  })

  // Enable all free modules by default
  const { data: freeModules } = await supabase
    .from('modules')
    .select('id')
    .eq('tier', 'free')

  if (freeModules) {
    await supabase.from('org_modules').insert(
      freeModules.map((m) => ({
        org_id: org.id,
        module_id: m.id,
        enabled: true,
        enabled_by: user.id,
      }))
    )

    // Auto-activate free modules for the owner
    await supabase.from('member_module_access').insert(
      freeModules.map((m) => ({
        member_id: user.id,
        org_id: org.id,
        module_id: m.id,
        status: 'active' as const,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
      }))
    )
  }

  revalidatePath('/dashboard')
  revalidatePath('/modules')
  return { success: true, orgId: org.id }
}
