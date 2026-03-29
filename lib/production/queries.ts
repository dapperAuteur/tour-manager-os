import { createClient } from '@/lib/supabase/server'

export async function getEquipment(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('org_id', orgId)
    .order('category', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getStagePlots(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stage_plots')
    .select('*, shows(date, city, venue_name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getInputLists(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('input_lists')
    .select('*, input_channels(count)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getInputListWithChannels(listId: string) {
  const supabase = await createClient()
  const { data: list, error } = await supabase
    .from('input_lists')
    .select('*')
    .eq('id', listId)
    .single()

  if (error) throw error

  const { data: channels } = await supabase
    .from('input_channels')
    .select('*')
    .eq('input_list_id', listId)
    .order('channel_number', { ascending: true })

  return { list, channels: channels || [] }
}

export async function getVenueNotes(orgId: string, search?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('venue_notes')
    .select('*, user_profiles:created_by(display_name)')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false })

  if (search) {
    query = query.or(`venue_name.ilike.%${search}%,content.ilike.%${search}%,city.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}
