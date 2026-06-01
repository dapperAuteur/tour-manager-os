'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true; id?: string } | { error: string }

export async function createContactGroup(formData: FormData): Promise<Result> {
  const name = ((formData.get('name') as string | null) || '').trim()
  const description = ((formData.get('description') as string | null) || '').trim()
  if (!name) return { error: 'Group name is required.' }
  if (name.length > 80) return { error: 'Group name is too long.' }

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
  if (!membership?.org_id) {
    return { error: 'You need to be in an organization first.' }
  }

  const { data, error } = await supabase
    .from('contact_groups')
    .insert({
      org_id: membership.org_id,
      name,
      description: description || null,
      created_by: user.id,
    })
    .select('id')
    .maybeSingle()
  if (error) return { error: error.message }

  revalidatePath('/settings/contact-groups')
  return { ok: true, id: data?.id }
}

export async function deleteContactGroup(groupId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_groups')
    .delete()
    .eq('id', groupId)
  if (error) return { error: error.message }
  revalidatePath('/settings/contact-groups')
  return { ok: true }
}

export async function addContactToGroup(
  groupId: string,
  contactId: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_group_members')
    .upsert(
      { group_id: groupId, contact_id: contactId },
      { onConflict: 'group_id,contact_id' },
    )
  if (error) return { error: error.message }
  revalidatePath('/settings/contact-groups')
  return { ok: true }
}

export async function removeContactFromGroup(
  groupId: string,
  contactId: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('contact_id', contactId)
  if (error) return { error: error.message }
  revalidatePath('/settings/contact-groups')
  return { ok: true }
}

export async function setGroupVisibility(
  groupId: string,
  userIds: string[],
): Promise<Result> {
  const supabase = await createClient()

  // Replace the visibility list — delete-then-insert.
  await supabase
    .from('contact_group_visibility')
    .delete()
    .eq('group_id', groupId)

  if (userIds.length > 0) {
    const rows = userIds.map((uid) => ({ group_id: groupId, user_id: uid }))
    const { error } = await supabase
      .from('contact_group_visibility')
      .insert(rows)
    if (error) return { error: error.message }
  }
  revalidatePath('/settings/contact-groups')
  return { ok: true }
}

export async function updateContactTags(
  venueId: string,
  contactId: string,
  tagsCsv: string,
): Promise<Result> {
  const tags = tagsCsv
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= 40)
    .slice(0, 12)

  const supabase = await createClient()
  const { error } = await supabase
    .from('venue_contacts')
    .update({ tags })
    .eq('id', contactId)
    .eq('venue_id', venueId)
  if (error) return { error: error.message }
  revalidatePath(`/venues/${venueId}`)
  return { ok: true }
}
