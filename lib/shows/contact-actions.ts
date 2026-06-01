'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

export async function addShowContact(
  tourId: string,
  showId: string,
  contactId: string,
  roleOverride: string | null,
  note: string | null,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from('show_contacts').upsert(
    {
      show_id: showId,
      contact_id: contactId,
      role_override: roleOverride || null,
      note: note || null,
    },
    { onConflict: 'show_id,contact_id' },
  )
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/shows/${showId}`)
  return { ok: true }
}

export async function removeShowContact(
  tourId: string,
  showId: string,
  contactId: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('show_contacts')
    .delete()
    .eq('show_id', showId)
    .eq('contact_id', contactId)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/shows/${showId}`)
  return { ok: true }
}
