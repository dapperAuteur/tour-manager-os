'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

const VALID_CATEGORIES = [
  'technical',
  'hospitality',
  'dressing_room',
  'crew',
  'transportation',
  'security',
  'other',
] as const
const VALID_STATUSES = [
  'pending',
  'delivered',
  'partial',
  'missing',
  'na',
] as const

interface CheckInput {
  category: string
  description: string
  expected_quantity: number | null
  notes: string | null
}

function parseCheck(formData: FormData): CheckInput | { error: string } {
  const category = ((formData.get('category') as string | null) || '').trim() || 'hospitality'
  const description = ((formData.get('description') as string | null) || '').trim()
  const expRaw = ((formData.get('expected_quantity') as string | null) || '').trim()
  const notes = ((formData.get('notes') as string | null) || '').trim() || null

  if (!description) return { error: 'Description is required.' }
  if (!(VALID_CATEGORIES as readonly string[]).includes(category)) {
    return { error: 'Pick a valid category.' }
  }
  let expectedQty: number | null = null
  if (expRaw) {
    const n = Number(expRaw)
    if (!Number.isFinite(n) || n < 0) return { error: 'Expected qty must be a non-negative number.' }
    expectedQty = Math.round(n)
  }
  return { category, description, expected_quantity: expectedQty, notes }
}

export async function addRiderCheck(
  tourId: string,
  showId: string,
  formData: FormData,
): Promise<Result> {
  const parsed = parseCheck(formData)
  if ('error' in parsed) return parsed
  const supabase = await createClient()
  const { error } = await supabase.from('show_rider_checks').insert({
    show_id: showId,
    ...parsed,
  })
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/shows/${showId}/rider`)
  return { ok: true }
}

export async function updateRiderCheckStatus(
  tourId: string,
  showId: string,
  checkId: string,
  status: string,
  actualQuantity: number | null,
  notes: string,
): Promise<Result> {
  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    return { error: 'Invalid status.' }
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('show_rider_checks')
    .update({
      status,
      actual_quantity: actualQuantity,
      notes: notes.trim() || null,
      checked_by_user_id: user?.id || null,
      checked_at: new Date().toISOString(),
    })
    .eq('id', checkId)
    .eq('show_id', showId)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/shows/${showId}/rider`)
  return { ok: true }
}

export async function deleteRiderCheck(
  tourId: string,
  showId: string,
  checkId: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('show_rider_checks')
    .delete()
    .eq('id', checkId)
    .eq('show_id', showId)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/shows/${showId}/rider`)
  return { ok: true }
}

/**
 * Copy every org_rider_items row into this show as fresh
 * show_rider_checks (status=pending). Lets the band stamp their
 * default rider on a show in one click.
 */
export async function importOrgRiderTemplate(
  tourId: string,
  showId: string,
): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (!membership?.org_id) return { error: 'No org found.' }

  const { data: template } = await supabase
    .from('org_rider_items')
    .select('id, category, description, expected_quantity, notes, sort_order')
    .eq('org_id', membership.org_id)
  if (!template || template.length === 0) {
    return { error: 'Your org has no rider template yet. Add items at /settings/rider-template first.' }
  }

  const rows = template.map((t) => ({
    show_id: showId,
    source_item_id: t.id,
    category: t.category,
    description: t.description,
    expected_quantity: t.expected_quantity,
    notes: t.notes,
    sort_order: t.sort_order,
  }))
  const { error } = await supabase.from('show_rider_checks').insert(rows)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/shows/${showId}/rider`)
  return { ok: true }
}
