'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

export async function postPackageMessage(
  packageId: string,
  formData: FormData,
): Promise<Result> {
  const body = ((formData.get('body') as string | null) || '').trim()
  if (!body) return { error: 'Message can\'t be empty.' }
  if (body.length > 4000) return { error: 'Message is too long (max 4000).' }

  const actId = ((formData.get('act_id') as string | null) || '').trim() || null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // Sender name snapshot.
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()
  const senderName =
    (profile?.display_name as string | null) ||
    (user.user_metadata?.display_name as string | null) ||
    user.email?.split('@')[0] ||
    null

  // Act label snapshot.
  let actLabel: string | null = null
  if (actId) {
    const { data: act } = await supabase
      .from('package_acts')
      .select('act_name')
      .eq('id', actId)
      .eq('package_id', packageId)
      .maybeSingle()
    actLabel = (act?.act_name as string | null) || null
  }

  const { error } = await supabase.from('package_messages').insert({
    package_id: packageId,
    sender_user_id: user.id,
    sender_act_id: actId,
    sender_name: senderName,
    sender_act_label: actLabel,
    body,
  })
  if (error) return { error: error.message }
  revalidatePath(`/packages/${packageId}/messages`)
  return { ok: true }
}

export async function deletePackageMessage(
  packageId: string,
  messageId: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('package_messages')
    .delete()
    .eq('id', messageId)
  if (error) return { error: error.message }
  revalidatePath(`/packages/${packageId}/messages`)
  return { ok: true }
}
