'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createTour(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const artistName = formData.get('artist_name') as string
  const description = formData.get('description') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string

  if (!name || !artistName) {
    return { error: 'Tour name and artist name are required' }
  }

  const { data, error } = await supabase
    .from('tours')
    .insert({
      name,
      artist_name: artistName,
      description: description || null,
      start_date: startDate || null,
      end_date: endDate || null,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect(`/tours/${data.id}`)
}

export async function updateTour(tourId: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const artistName = formData.get('artist_name') as string
  const description = formData.get('description') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('tours')
    .update({
      name,
      artist_name: artistName,
      description: description || null,
      start_date: startDate || null,
      end_date: endDate || null,
      status: status || 'draft',
    })
    .eq('id', tourId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/tours/${tourId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function createShow(tourId: string, formData: FormData) {
  const supabase = await createClient()

  const date = formData.get('date') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const country = formData.get('country') as string
  const venueName = formData.get('venue_name') as string
  const timezone = formData.get('timezone') as string

  if (!date || !city) {
    return { error: 'Date and city are required' }
  }

  const { data, error } = await supabase
    .from('shows')
    .insert({
      tour_id: tourId,
      date,
      city,
      state: state || null,
      country: country || 'US',
      venue_name: venueName || null,
      timezone: timezone || 'America/New_York',
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  // Auto-create advance sheet for the show
  await supabase
    .from('advance_sheets')
    .insert({ show_id: data.id })

  revalidatePath(`/tours/${tourId}`)
  redirect(`/tours/${tourId}`)
}

export async function updateShowStatus(showId: string, tourId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shows')
    .update({ status })
    .eq('id', showId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/tours/${tourId}`)
  return { success: true }
}

export async function deleteShow(showId: string, tourId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shows')
    .delete()
    .eq('id', showId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/tours/${tourId}`)
  return { success: true }
}
