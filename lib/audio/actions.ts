'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function uploadAudio(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const fileUrl = formData.get('file_url') as string
  const durationSeconds = formData.get('duration_seconds') as string

  if (!title || !fileUrl) return { error: 'Title and file URL are required' }

  const { error } = await supabase.from('shared_audio').insert({
    org_id: orgId,
    title,
    description: description || null,
    file_url: fileUrl,
    duration_seconds: durationSeconds ? parseInt(durationSeconds) : null,
    uploaded_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/hub/audio')
  redirect('/hub/audio')
}

export async function addAudioComment(audioId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  const timestampSeconds = formData.get('timestamp_seconds') as string

  if (!content) return { error: 'Content is required' }

  const { error } = await supabase.from('audio_comments').insert({
    audio_id: audioId,
    user_id: user.id,
    content,
    timestamp_seconds: timestampSeconds ? parseInt(timestampSeconds) : null,
  })

  if (error) return { error: error.message }
  revalidatePath('/hub/audio')
  return { success: true }
}
