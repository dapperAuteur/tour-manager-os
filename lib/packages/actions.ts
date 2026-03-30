'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createTourPackage(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const packageType = formData.get('package_type') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string

  if (!name) return { error: 'Name is required' }

  const { data, error } = await supabase.from('tour_packages').insert({
    name,
    description: description || null,
    package_type: packageType || 'tour',
    start_date: startDate || null,
    end_date: endDate || null,
    created_by: user.id,
    org_id: orgId,
  }).select('id').single()

  if (error) return { error: error.message }
  revalidatePath('/packages')
  redirect(`/packages/${data.id}`)
}

export async function addActToPackage(packageId: string, formData: FormData) {
  const supabase = await createClient()

  const actName = formData.get('act_name') as string
  const actType = formData.get('act_type') as string
  const setLength = formData.get('set_length_minutes') as string
  const contactName = formData.get('contact_name') as string
  const contactEmail = formData.get('contact_email') as string
  const contactPhone = formData.get('contact_phone') as string

  if (!actName) return { error: 'Act name is required' }

  const { error } = await supabase.from('package_acts').insert({
    package_id: packageId,
    act_name: actName,
    act_type: actType || 'support',
    set_length_minutes: setLength ? parseInt(setLength) : null,
    contact_name: contactName || null,
    contact_email: contactEmail || null,
    contact_phone: contactPhone || null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/packages/${packageId}`)
  return { success: true }
}

export async function addTimelineBlock(packageId: string, date: string, formData: FormData) {
  const supabase = await createClient()

  // Get or create timeline for this date
  let { data: timeline } = await supabase
    .from('production_timeline')
    .select('id')
    .eq('package_id', packageId)
    .eq('date', date)
    .single()

  if (!timeline) {
    const { data: newTimeline, error } = await supabase
      .from('production_timeline')
      .insert({ package_id: packageId, date })
      .select('id')
      .single()
    if (error) return { error: error.message }
    timeline = newTimeline
  }

  const { error } = await supabase.from('timeline_blocks').insert({
    timeline_id: timeline.id,
    act_id: (formData.get('act_id') as string) || null,
    start_time: formData.get('start_time') as string,
    end_time: (formData.get('end_time') as string) || null,
    block_type: formData.get('block_type') as string,
    label: formData.get('label') as string,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/packages/${packageId}/timeline`)
  return { success: true }
}

export async function removeAct(actId: string, packageId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('package_acts').delete().eq('id', actId)
  if (error) return { error: error.message }
  revalidatePath(`/packages/${packageId}`)
  return { success: true }
}
