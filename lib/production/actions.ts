'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function addEquipment(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('equipment').insert({
    org_id: orgId,
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    description: (formData.get('description') as string) || null,
    serial_number: (formData.get('serial_number') as string) || null,
    quantity: Number(formData.get('quantity')) || 1,
    condition: (formData.get('condition') as string) || 'good',
    travels_with_band: formData.get('travels_with_band') === 'yes',
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/production/equipment')
  redirect('/production/equipment')
}

export async function deleteEquipment(equipmentId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('equipment').delete().eq('id', equipmentId)
  if (error) return { error: error.message }
  revalidatePath('/production/equipment')
  return { success: true }
}

export async function createStagePlot(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('stage_plots').insert({
    org_id: orgId,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    stage_width: Number(formData.get('stage_width')) || null,
    stage_depth: Number(formData.get('stage_depth')) || null,
    show_id: (formData.get('show_id') as string) || null,
    is_default: formData.get('is_default') === 'on',
    created_by: user?.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/production/stage-plots')
  redirect('/production/stage-plots')
}

export async function createInputList(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name) return { error: 'Name is required' }

  const { data: list, error } = await supabase
    .from('input_lists')
    .insert({ org_id: orgId, name, is_default: formData.get('is_default') === 'on' })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Parse channels from form
  const channels: { channel_number: number; instrument: string; microphone?: string; di_box?: boolean; phantom_power?: boolean }[] = []
  let i = 0
  while (formData.get(`ch_${i}_instrument`)) {
    channels.push({
      channel_number: i + 1,
      instrument: formData.get(`ch_${i}_instrument`) as string,
      microphone: (formData.get(`ch_${i}_microphone`) as string) || undefined,
      di_box: formData.get(`ch_${i}_di`) === 'on',
      phantom_power: formData.get(`ch_${i}_phantom`) === 'on',
    })
    i++
  }

  if (channels.length > 0) {
    await supabase.from('input_channels').insert(
      channels.map((ch) => ({ input_list_id: list.id, ...ch }))
    )
  }

  revalidatePath('/production/input-lists')
  redirect('/production/input-lists')
}

export async function addVenueNote(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('venue_notes').insert({
    org_id: orgId,
    venue_name: formData.get('venue_name') as string,
    city: (formData.get('city') as string) || null,
    state: (formData.get('state') as string) || null,
    content: formData.get('content') as string,
    category: (formData.get('category') as string) || null,
    created_by: user?.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/production/venue-notes')
  redirect('/production/venue-notes')
}
