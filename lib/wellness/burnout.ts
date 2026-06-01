import { createClient } from '@/lib/supabase/server'

export type RiskLevel = 'low' | 'elevated' | 'high'

export interface BurnoutSignal {
  key: string
  label: string
  detail: string
  weight: number
}

export interface BurnoutAssessment {
  userId: string
  windowDays: number
  logsAnalyzed: number
  showsInWindow: number
  score: number
  level: RiskLevel
  signals: BurnoutSignal[]
  averages: {
    sleep_hours: number | null
    sleep_quality: number | null
    energy_level: number | null
    mood: number | null
    stress_level: number | null
    voice_condition: number | null
  }
  recommendations: string[]
}

function avg(nums: (number | null | undefined)[]): number | null {
  const v = nums.filter((n): n is number => typeof n === 'number')
  return v.length === 0 ? null : v.reduce((a, b) => a + b, 0) / v.length
}

function consecutiveBelow(
  sorted: { date: string; value: number | null }[],
  threshold: number,
): number {
  let best = 0
  let cur = 0
  for (const row of sorted) {
    if (row.value != null && row.value <= threshold) {
      cur++
      best = Math.max(best, cur)
    } else if (row.value != null) {
      cur = 0
    }
  }
  return best
}

/**
 * Burnout = chronic strain across sleep, energy, mood, stress, voice, and
 * schedule density. Each contributing signal adds a weighted score; the
 * total is clamped to 0–100 and bucketed into low/elevated/high. The aim
 * is to flag a conversation, not a diagnosis — pair with the days-off
 * planner so the recommendations have somewhere to land.
 */
export async function assessBurnoutFor(
  userId: string,
  windowDays = 14,
): Promise<BurnoutAssessment> {
  const supabase = await createClient()

  const start = new Date()
  start.setDate(start.getDate() - windowDays)
  const startStr = start.toISOString().slice(0, 10)

  const { data: logs } = await supabase
    .from('wellness_logs')
    .select(
      'date, sleep_hours, sleep_quality, energy_level, mood, stress_level, voice_condition',
    )
    .eq('user_id', userId)
    .gte('date', startStr)
    .order('date', { ascending: true })

  const rows = logs || []
  const sleepHours = rows.map((r) => r.sleep_hours)
  const sleepQuality = rows.map((r) => r.sleep_quality)
  const energy = rows.map((r) => r.energy_level)
  const mood = rows.map((r) => r.mood)
  const stress = rows.map((r) => r.stress_level)
  const voice = rows.map((r) => r.voice_condition)

  const averages = {
    sleep_hours: avg(sleepHours),
    sleep_quality: avg(sleepQuality),
    energy_level: avg(energy),
    mood: avg(mood),
    stress_level: avg(stress),
    voice_condition: avg(voice),
  }

  // Show density inside the same window.
  const { count: showCount } = await supabase
    .from('shows')
    .select('id', { count: 'exact', head: true })
    .gte('date', startStr)

  const signals: BurnoutSignal[] = []
  let score = 0

  if (averages.sleep_hours != null && averages.sleep_hours < 6) {
    const w = averages.sleep_hours < 5 ? 22 : 14
    signals.push({
      key: 'sleep_low',
      label: 'Sleep below 6 hrs on average',
      detail: `${averages.sleep_hours.toFixed(1)} hrs/night — target is 7+.`,
      weight: w,
    })
    score += w
  }
  const sleepStreak = consecutiveBelow(
    rows.map((r) => ({ date: r.date, value: r.sleep_hours })),
    5.5,
  )
  if (sleepStreak >= 3) {
    signals.push({
      key: 'sleep_streak',
      label: `${sleepStreak} nights in a row under 5.5 hrs`,
      detail: 'Cumulative sleep debt is the strongest single predictor of burnout in touring musicians.',
      weight: 12,
    })
    score += 12
  }

  if (averages.energy_level != null && averages.energy_level <= 4) {
    signals.push({
      key: 'energy_low',
      label: 'Energy averaging ≤ 4 / 10',
      detail: `Mean energy ${averages.energy_level.toFixed(1)} — flag a rest day.`,
      weight: 14,
    })
    score += 14
  }
  const lowEnergyStreak = consecutiveBelow(
    rows.map((r) => ({ date: r.date, value: r.energy_level })),
    4,
  )
  if (lowEnergyStreak >= 3) {
    signals.push({
      key: 'energy_streak',
      label: `${lowEnergyStreak} days of low energy in a row`,
      detail: 'Three back-to-back low-energy days correlates with skipped warmups + worse vocal performance.',
      weight: 10,
    })
    score += 10
  }

  if (averages.mood != null && averages.mood <= 4) {
    signals.push({
      key: 'mood_low',
      label: 'Mood averaging ≤ 4 / 10',
      detail: `Mean mood ${averages.mood.toFixed(1)} — consider a check-in.`,
      weight: 12,
    })
    score += 12
  }

  if (averages.stress_level != null && averages.stress_level >= 7) {
    signals.push({
      key: 'stress_high',
      label: 'Stress averaging ≥ 7 / 10',
      detail: `Mean stress ${averages.stress_level.toFixed(1)} — schedule a slow day if possible.`,
      weight: 12,
    })
    score += 12
  }

  if (averages.voice_condition != null && averages.voice_condition <= 4) {
    signals.push({
      key: 'voice_low',
      label: 'Voice condition averaging ≤ 4 / 10',
      detail: `Mean voice ${averages.voice_condition.toFixed(1)} — rest or steam before the next show.`,
      weight: 10,
    })
    score += 10
  }

  const density = (showCount ?? 0) / windowDays
  if (density >= 0.7) {
    signals.push({
      key: 'density_high',
      label: `${showCount} shows in the last ${windowDays} days`,
      detail: 'Schedule density above 0.7 shows/day historically pairs with burnout absent intentional off-days.',
      weight: 10,
    })
    score += 10
  }

  if (rows.length < windowDays / 2) {
    signals.push({
      key: 'data_sparse',
      label: 'Sparse wellness data',
      detail: `Only ${rows.length} logs in the last ${windowDays} days — assessment confidence is low.`,
      weight: 0,
    })
  }

  score = Math.min(100, score)
  const level: RiskLevel = score >= 55 ? 'high' : score >= 30 ? 'elevated' : 'low'

  const recommendations: string[] = []
  if (signals.some((s) => s.key.startsWith('sleep'))) {
    recommendations.push('Block a sleep-protected day in the days-off planner — no early lobby calls, no late soundcheck.')
  }
  if (signals.some((s) => s.key === 'voice_low')) {
    recommendations.push('Schedule a 24-hour vocal-rest window and a warmup routine before the next show.')
  }
  if (signals.some((s) => s.key === 'density_high')) {
    recommendations.push('Push the nearest non-anchor show by a day if the venue allows — burnout climbs above 0.7 shows/day.')
  }
  if (signals.some((s) => s.key === 'mood_low' || s.key === 'stress_high')) {
    recommendations.push('Open a family check-in to surface what is grinding and pair with a Rise Wellness conversation if it persists.')
  }
  if (recommendations.length === 0 && rows.length > 0) {
    recommendations.push('Keep logging — the planner picks up trends faster with daily entries.')
  }

  return {
    userId,
    windowDays,
    logsAnalyzed: rows.length,
    showsInWindow: showCount ?? 0,
    score,
    level,
    signals,
    averages,
    recommendations,
  }
}
