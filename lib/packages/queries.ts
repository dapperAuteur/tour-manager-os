import { createClient } from '@/lib/supabase/server'

export async function getTourPackages(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tour_packages')
    .select('*, package_acts(count)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getTourPackageWithActs(packageId: string) {
  const supabase = await createClient()

  const { data: pkg, error } = await supabase
    .from('tour_packages')
    .select('*')
    .eq('id', packageId)
    .single()

  if (error) throw error

  const { data: acts } = await supabase
    .from('package_acts')
    .select('*')
    .eq('package_id', packageId)
    .order('sort_order', { ascending: true })

  return { package: pkg, acts: acts || [] }
}

export async function getProductionTimeline(packageId: string, date: string) {
  const supabase = await createClient()

  const { data: timeline } = await supabase
    .from('production_timeline')
    .select('*')
    .eq('package_id', packageId)
    .eq('date', date)
    .single()

  if (!timeline) return { timeline: null, blocks: [] }

  const { data: blocks } = await supabase
    .from('timeline_blocks')
    .select('*, package_acts(act_name, act_type)')
    .eq('timeline_id', timeline.id)
    .order('start_time', { ascending: true })

  return { timeline, blocks: blocks || [] }
}

export async function getPackageTimelines(packageId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('production_timeline')
    .select('*, timeline_blocks(count)')
    .eq('package_id', packageId)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}
