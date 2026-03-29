'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ---- POLLS ----

export async function createPoll(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const question = formData.get('question') as string
  const description = formData.get('description') as string
  const allowMultiple = formData.get('allow_multiple') === 'on'
  const closesAt = formData.get('closes_at') as string
  const options = formData.getAll('option') as string[]

  if (!question) return { error: 'Question is required' }
  const validOptions = options.filter((o) => o.trim())
  if (validOptions.length < 2) return { error: 'At least 2 options are required' }

  const { data: poll, error } = await supabase
    .from('polls')
    .insert({
      org_id: orgId,
      question,
      description: description || null,
      allow_multiple: allowMultiple,
      closes_at: closesAt || null,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await supabase.from('poll_options').insert(
    validOptions.map((label, i) => ({
      poll_id: poll.id,
      label,
      sort_order: i,
    }))
  )

  revalidatePath('/hub/polls')
  redirect('/hub/polls')
}

export async function votePoll(pollId: string, optionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if poll allows multiple votes
  const { data: poll } = await supabase
    .from('polls')
    .select('allow_multiple, status')
    .eq('id', pollId)
    .single()

  if (!poll || poll.status !== 'open') return { error: 'Poll is closed' }

  if (!poll.allow_multiple) {
    // Remove existing vote
    await supabase.from('poll_votes').delete().eq('poll_id', pollId).eq('user_id', user.id)
  }

  const { error } = await supabase.from('poll_votes').insert({
    poll_id: pollId,
    option_id: optionId,
    user_id: user.id,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Already voted for this option' }
    return { error: error.message }
  }

  revalidatePath('/hub/polls')
  return { success: true }
}

export async function closePoll(pollId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('polls').update({ status: 'closed' }).eq('id', pollId)
  if (error) return { error: error.message }
  revalidatePath('/hub/polls')
  return { success: true }
}

// ---- PRACTICE ----

export async function createPracticeSession(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string

  if (!title || !date || !startTime) return { error: 'Title, date, and start time are required' }

  const { error } = await supabase.from('practice_sessions').insert({
    org_id: orgId,
    title,
    description: description || null,
    location: location || null,
    date,
    start_time: startTime,
    end_time: endTime || null,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/hub/practice')
  redirect('/hub/practice')
}

export async function rsvpPractice(sessionId: string, status: 'going' | 'maybe' | 'not_going') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('practice_rsvps').upsert({
    session_id: sessionId,
    user_id: user.id,
    status,
  })

  if (error) return { error: error.message }
  revalidatePath('/hub/practice')
  return { success: true }
}

// ---- ALBUMS ----

export async function createAlbum(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tourId = formData.get('tour_id') as string

  if (!title) return { error: 'Title is required' }

  const { error } = await supabase.from('shared_albums').insert({
    org_id: orgId,
    tour_id: tourId || null,
    title,
    description: description || null,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/hub/albums')
  redirect('/hub/albums')
}

export async function addMediaToAlbum(albumId: string, url: string, mediaType: 'image' | 'video', caption?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('album_media').insert({
    album_id: albumId,
    uploaded_by: user.id,
    url,
    media_type: mediaType,
    caption: caption || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/hub/albums')
  return { success: true }
}
