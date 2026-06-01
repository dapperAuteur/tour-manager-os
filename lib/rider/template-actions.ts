'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

const VALID_CATEGORIES = [
  'technical', 'hospitality', 'dressing_room', 'crew', 'transportation', 'security', 'other',
] as const

async function getOrgId(): Promise<string | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .limit(1)
    .maybeSingle()
  if (!membership?.org_id) return { error: 'Org owner or admin only.' }
  return membership.org_id
}

export async function addTemplateItem(formData: FormData): Promise<Result> {
  const orgId = await getOrgId()
  if (typeof orgId !== 'string') return orgId

  const category =
    ((formData.get('category') as string | null) || 'hospitality').trim()
  const description = ((formData.get('description') as string | null) || '').trim()
  const expRaw = ((formData.get('expected_quantity') as string | null) || '').trim()
  const notes = ((formData.get('notes') as string | null) || '').trim() || null

  if (!description) return { error: 'Description is required.' }
  if (!(VALID_CATEGORIES as readonly string[]).includes(category)) {
    return { error: 'Invalid category.' }
  }
  const expectedQty = expRaw ? Number(expRaw) : null
  if (expectedQty != null && (!Number.isFinite(expectedQty) || expectedQty < 0)) {
    return { error: 'Expected qty must be a non-negative number.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('org_rider_items').insert({
    org_id: orgId,
    category,
    description,
    expected_quantity: expectedQty,
    notes,
  })
  if (error) return { error: error.message }
  revalidatePath('/settings/rider-template')
  return { ok: true }
}

export async function deleteTemplateItem(itemId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('org_rider_items')
    .delete()
    .eq('id', itemId)
  if (error) return { error: error.message }
  revalidatePath('/settings/rider-template')
  return { ok: true }
}
