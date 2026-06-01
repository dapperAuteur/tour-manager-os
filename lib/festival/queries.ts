import { createClient } from '@/lib/supabase/server'

export interface FestivalSlot {
  id: string
  show_id: string
  stage_id: string | null
  stage_name: string | null
  package_act_id: string | null
  act_name: string
  set_start_at: string | null
  set_length_minutes: number | null
  notes: string | null
}

export interface FestivalContext {
  slots: FestivalSlot[]
  /** Stages from the show's venue (if a venue is matched by name). */
  stages: { id: string; name: string; location: string }[]
  /** Acts from any package this tour participates in. */
  acts: { id: string; act_name: string; act_type: string }[]
}

export async function getFestivalContext(
  showId: string,
  tourId: string,
  venueName: string | null,
): Promise<FestivalContext> {
  const supabase = await createClient()

  const [slotsRes, stagesRes, actsRes] = await Promise.all([
    supabase
      .from('festival_slots')
      .select(`
        id, show_id, stage_id, package_act_id, act_name_override,
        set_start_at, set_length_minutes, notes,
        venue_stages(name),
        package_acts(act_name, act_type)
      `)
      .eq('show_id', showId)
      .order('set_start_at', { nullsFirst: false, ascending: true }),
    venueName
      ? supabase
          .from('venue_stages')
          .select('id, name, location, venue_profiles!inner(name)')
          .ilike('venue_profiles.name', venueName)
          .order('name')
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; location: string }>, error: null }),
    supabase
      .from('package_acts')
      .select('id, act_name, act_type, tour_id')
      .or(`tour_id.eq.${tourId},package_id.in.(select package_id from package_tours where tour_id.eq.${tourId})`)
      .order('sort_order')
      .order('act_name'),
  ])

  const slots: FestivalSlot[] = (slotsRes.data || []).map((row) => {
    const stage = row.venue_stages as unknown as { name: string } | null
    const act = row.package_acts as unknown as { act_name: string; act_type: string } | null
    return {
      id: row.id,
      show_id: row.show_id,
      stage_id: row.stage_id as string | null,
      stage_name: stage?.name ?? null,
      package_act_id: row.package_act_id as string | null,
      act_name: row.act_name_override || act?.act_name || 'Unnamed act',
      set_start_at: row.set_start_at as string | null,
      set_length_minutes: row.set_length_minutes as number | null,
      notes: row.notes as string | null,
    }
  })

  const stages = ((stagesRes.data as unknown as { id: string; name: string; location: string }[]) || []).map((s) => ({
    id: s.id,
    name: s.name,
    location: s.location,
  }))

  const acts = (actsRes.data || []).map((a) => ({
    id: a.id,
    act_name: a.act_name,
    act_type: a.act_type,
  }))

  return { slots, stages, acts }
}
