import { createClient } from '@/lib/supabase/server'

export async function getWellnessLog(userId: string, date: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('wellness_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()
  return data
}

export async function getWellnessHistory(userId: string, days: number = 14) {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data } = await supabase
    .from('wellness_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false })

  return data || []
}

export async function getWarmupRoutines() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('warmup_routines')
    .select('*')
    .order('routine_type', { ascending: true })

  return data || []
}

export async function getFamilyCheckins(orgId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('family_checkins')
    .select('*, checkin_responses(*, user_profiles:user_id(display_name)), user_profiles:created_by(display_name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(10)

  return data || []
}
