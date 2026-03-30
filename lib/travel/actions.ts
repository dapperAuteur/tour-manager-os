'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createArrangement(tourId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const type = formData.get('type') as string
  const vendor = formData.get('vendor') as string
  const confirmationNumber = formData.get('confirmation_number') as string
  const checkIn = formData.get('check_in') as string
  const checkOut = formData.get('check_out') as string
  const cost = formData.get('cost') as string
  const address = formData.get('address') as string
  const phone = formData.get('phone') as string
  const notes = formData.get('notes') as string
  const showId = formData.get('show_id') as string
  const status = formData.get('status') as string

  if (!type) return { error: 'Type is required' }

  const { error } = await supabase.from('travel_arrangements').insert({
    tour_id: tourId,
    type,
    vendor: vendor || null,
    confirmation_number: confirmationNumber || null,
    check_in: checkIn || null,
    check_out: checkOut || null,
    cost: cost ? parseFloat(cost) : null,
    address: address || null,
    phone: phone || null,
    notes: notes || null,
    show_id: showId || null,
    status: status || 'pending',
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/travel`)
  redirect(`/tours/${tourId}/travel`)
}
