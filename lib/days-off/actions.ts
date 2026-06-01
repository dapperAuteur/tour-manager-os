'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

const VALID_TYPES = [
  'rest', 'sightseeing', 'gym', 'spa', 'food', 'family', 'errands', 'other',
] as const

interface PlanInput {
  date: string
  activity_type: string
  title: string
  description: string | null
  location_name: string | null
  location_url: string | null
  is_group: boolean
}

function parsePlan(formData: FormData): PlanInput | { error: string } {
  const date = ((formData.get('date') as string | null) || '').trim()
  const activityType = ((formData.get('activity_type') as string | null) || 'rest').trim()
  const title = ((formData.get('title') as string | null) || '').trim()
  const description = ((formData.get('description') as string | null) || '').trim() || null
  const locationName = ((formData.get('location_name') as string | null) || '').trim() || null
  const locationUrl = ((formData.get('location_url') as string | null) || '').trim() || null
  const isGroup = formData.get('is_group') === 'on'

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'Date is required (YYYY-MM-DD).' }
  }
  if (!title) return { error: 'Title is required.' }
  if (!(VALID_TYPES as readonly string[]).includes(activityType)) {
    return { error: 'Invalid activity type.' }
  }
  return {
    date,
    activity_type: activityType,
    title,
    description,
    location_name: locationName,
    location_url: locationUrl,
    is_group: isGroup,
  }
}

export async function createDayOffPlan(
  tourId: string,
  formData: FormData,
): Promise<Result> {
  const parsed = parsePlan(formData)
  if ('error' in parsed) return parsed

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { error } = await supabase.from('day_off_plans').insert({
    tour_id: tourId,
    date: parsed.date,
    member_user_id: parsed.is_group ? null : user.id,
    activity_type: parsed.activity_type,
    title: parsed.title,
    description: parsed.description,
    location_name: parsed.location_name,
    location_url: parsed.location_url,
    created_by: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/days-off`)
  return { ok: true }
}

export async function updatePlanStatus(
  tourId: string,
  planId: string,
  status: 'planned' | 'done' | 'skipped',
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('day_off_plans')
    .update({ status })
    .eq('id', planId)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/days-off`)
  return { ok: true }
}

export async function deleteDayOffPlan(
  tourId: string,
  planId: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('day_off_plans')
    .delete()
    .eq('id', planId)
  if (error) return { error: error.message }
  revalidatePath(`/tours/${tourId}/days-off`)
  return { ok: true }
}
