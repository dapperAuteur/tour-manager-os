'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createSetlist(tourId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const showId = formData.get('show_id') as string

  if (!name) return { error: 'Name is required' }

  const { error } = await supabase.from('setlists').insert({
    tour_id: tourId,
    name,
    show_id: showId || null,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/setlist`)
  return { success: true }
}

export async function addSong(setlistId: string, tourId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const durationSeconds = formData.get('duration_seconds') as string
  const key = formData.get('key') as string
  const tempo = formData.get('tempo') as string
  const notes = formData.get('notes') as string
  const isEncore = formData.get('is_encore') === 'on'
  const sortOrder = formData.get('sort_order') as string

  if (!title) return { error: 'Title is required' }

  const { error } = await supabase.from('setlist_songs').insert({
    setlist_id: setlistId,
    title,
    duration_seconds: durationSeconds ? parseInt(durationSeconds) : null,
    key: key || null,
    tempo: tempo ? parseInt(tempo) : null,
    notes: notes || null,
    is_encore: isEncore,
    sort_order: sortOrder ? parseInt(sortOrder) : 0,
  })

  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/setlist`)
  return { success: true }
}

export async function addSetlistComment(setlistId: string, tourId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  if (!content) return { error: 'Content is required' }

  const { error } = await supabase.from('setlist_comments').insert({
    setlist_id: setlistId,
    user_id: user.id,
    content,
  })

  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/setlist`)
  return { success: true }
}

export async function deleteSetlistSong(songId: string, tourId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('setlist_songs').delete().eq('id', songId)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/setlist`)
  return { success: true }
}
