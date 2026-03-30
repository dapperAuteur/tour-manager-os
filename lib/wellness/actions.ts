'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function logWellness(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const date = formData.get('date') as string || new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('wellness_logs').upsert({
    user_id: user.id,
    date,
    sleep_hours: Number(formData.get('sleep_hours')) || null,
    sleep_quality: Number(formData.get('sleep_quality')) || null,
    energy_level: Number(formData.get('energy_level')) || null,
    mood: Number(formData.get('mood')) || null,
    stress_level: Number(formData.get('stress_level')) || null,
    hydration_glasses: Number(formData.get('hydration_glasses')) || null,
    meals_eaten: Number(formData.get('meals_eaten')) || null,
    exercised: formData.get('exercised') === 'on',
    warmup_completed: formData.get('warmup_completed') === 'on',
    performance_rating: Number(formData.get('performance_rating')) || null,
    voice_condition: Number(formData.get('voice_condition')) || null,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/wellness')
  return { success: true }
}

export async function createCheckin(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const prompt = formData.get('prompt') as string
  if (!prompt) return { error: 'Prompt is required' }

  const { error } = await supabase.from('family_checkins').insert({
    org_id: orgId,
    prompt,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/wellness/checkins')
  return { success: true }
}

export async function respondToCheckin(checkinId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('checkin_responses').upsert({
    checkin_id: checkinId,
    user_id: user.id,
    response: formData.get('response') as string,
    mood: Number(formData.get('mood')) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/wellness/checkins')
  return { success: true }
}
