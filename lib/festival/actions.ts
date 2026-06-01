'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

interface SlotInput {
  stage_id: string | null
  package_act_id: string | null
  act_name_override: string | null
  set_start_at: string | null
  set_length_minutes: number | null
  notes: string | null
}

function parseSlot(formData: FormData): SlotInput | { error: string } {
  const stageId = ((formData.get('stage_id') as string | null) || '').trim() || null
  const actId = ((formData.get('package_act_id') as string | null) || '').trim() || null
  const nameOverride = ((formData.get('act_name_override') as string | null) || '').trim() || null
  const startRaw = ((formData.get('set_start_at') as string | null) || '').trim()
  const lengthRaw = ((formData.get('set_length_minutes') as string | null) || '').trim()
  const notes = ((formData.get('notes') as string | null) || '').trim() || null

  if (!actId && !nameOverride) {
    return { error: 'Pick an act or type a name override.' }
  }

  let setStartAt: string | null = null
  if (startRaw) {
    // datetime-local arrives as "YYYY-MM-DDTHH:mm" without timezone;
    // Supabase will store it as UTC. That's fine for the lineup grid
    // since the show's local timezone is shown alongside.
    const d = new Date(startRaw)
    if (Number.isNaN(d.valueOf())) return { error: 'Start time is invalid.' }
    setStartAt = d.toISOString()
  }

  let setLength: number | null = null
  if (lengthRaw) {
    const n = Number(lengthRaw)
    if (!Number.isFinite(n) || n <= 0 || n > 600) {
      return { error: 'Set length must be between 1 and 600 minutes.' }
    }
    setLength = Math.round(n)
  }

  return {
    stage_id: stageId,
    package_act_id: actId,
    act_name_override: nameOverride,
    set_start_at: setStartAt,
    set_length_minutes: setLength,
    notes,
  }
}

export async function createFestivalSlot(
  tourId: string,
  showId: string,
  formData: FormData,
): Promise<Result> {
  const parsed = parseSlot(formData)
  if ('error' in parsed) return parsed
  const supabase = await createClient()
  const { error } = await supabase.from('festival_slots').insert({
    show_id: showId,
    ...parsed,
  })
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/shows/${showId}/festival`)
  return { ok: true }
}

export async function updateFestivalSlot(
  tourId: string,
  showId: string,
  slotId: string,
  formData: FormData,
): Promise<Result> {
  const parsed = parseSlot(formData)
  if ('error' in parsed) return parsed
  const supabase = await createClient()
  const { error } = await supabase
    .from('festival_slots')
    .update(parsed)
    .eq('id', slotId)
    .eq('show_id', showId)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/shows/${showId}/festival`)
  return { ok: true }
}

export async function deleteFestivalSlot(
  tourId: string,
  showId: string,
  slotId: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('festival_slots')
    .delete()
    .eq('id', slotId)
    .eq('show_id', showId)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/shows/${showId}/festival`)
  return { ok: true }
}
