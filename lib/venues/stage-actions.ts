'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

const ALLOWED_LOCATIONS = new Set(['indoor', 'outdoor', 'tent', 'other'])

interface ParsedStage {
  name: string
  location: string
  capacity: number | null
  width: number | null
  depth: number | null
  height: number | null
  pa_system: string | null
  notes: string | null
}

function parseStage(form: FormData): ParsedStage | { error: string } {
  const name = ((form.get('name') as string | null) || '').trim()
  const location = (form.get('location') as string | null) || 'indoor'
  const capacityRaw = (form.get('capacity') as string | null) || ''
  const widthRaw = (form.get('width') as string | null) || ''
  const depthRaw = (form.get('depth') as string | null) || ''
  const heightRaw = (form.get('height') as string | null) || ''
  const paSystem = ((form.get('pa_system') as string | null) || '').trim()
  const notes = ((form.get('notes') as string | null) || '').trim()

  if (!name) return { error: 'Stage name is required.' }
  if (name.length > 80) return { error: 'Stage name is too long.' }
  if (!ALLOWED_LOCATIONS.has(location)) return { error: 'Pick a location.' }

  const num = (s: string): number | null => {
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  return {
    name,
    location,
    capacity: capacityRaw ? Number(capacityRaw) : null,
    width: num(widthRaw),
    depth: num(depthRaw),
    height: num(heightRaw),
    pa_system: paSystem || null,
    notes: notes || null,
  }
}

export async function createVenueStage(
  venueId: string,
  formData: FormData,
): Promise<Result> {
  const parsed = parseStage(formData)
  if ('error' in parsed) return parsed
  const supabase = await createClient()
  const { error } = await supabase.from('venue_stages').insert({
    venue_id: venueId,
    ...parsed,
  })
  if (error) return { error: error.message }
  revalidatePath(`/venues/${venueId}`)
  return { ok: true }
}

export async function updateVenueStage(
  venueId: string,
  stageId: string,
  formData: FormData,
): Promise<Result> {
  const parsed = parseStage(formData)
  if ('error' in parsed) return parsed
  const supabase = await createClient()
  const { error } = await supabase
    .from('venue_stages')
    .update(parsed)
    .eq('id', stageId)
    .eq('venue_id', venueId)
  if (error) return { error: error.message }
  revalidatePath(`/venues/${venueId}`)
  return { ok: true }
}

export async function deleteVenueStage(
  venueId: string,
  stageId: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('venue_stages')
    .delete()
    .eq('id', stageId)
    .eq('venue_id', venueId)
  if (error) return { error: error.message }
  revalidatePath(`/venues/${venueId}`)
  return { ok: true }
}
