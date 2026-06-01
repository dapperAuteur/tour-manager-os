import { createAdminClient } from '@/lib/supabase/admin'

export async function getAdminDashboardStats() {
  const supabase = createAdminClient()

  const [usersRes, orgsRes, toursRes, showsRes, expensesRes, revenueRes, feedbackRes, merchRes] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('tours').select('id', { count: 'exact', head: true }),
    supabase.from('shows').select('id', { count: 'exact', head: true }),
    supabase.from('expenses').select('amount'),
    supabase.from('show_revenue').select('total_revenue'),
    supabase.from('feedback_threads').select('id, status'),
    supabase.from('merch_sales').select('total'),
  ])

  const totalUsers = usersRes.data?.users.length || 0
  const totalOrgs = orgsRes.count || 0
  const totalTours = toursRes.count || 0
  const totalShows = showsRes.count || 0

  const totalExpenses = (expensesRes.data || []).reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const totalRevenue = (revenueRes.data || []).reduce((sum, r) => sum + Number(r.total_revenue || 0), 0)
  const totalMerchRevenue = (merchRes.data || []).reduce((sum, s) => sum + Number(s.total || 0), 0)

  const feedbackThreads = feedbackRes.data || []
  const openFeedback = feedbackThreads.filter((f) => f.status === 'open' || f.status === 'in_progress').length

  // User type breakdown
  const { data: profiles } = await supabase.from('user_profiles').select('user_type')
  const userTypeBreakdown: Record<string, number> = {}
  for (const p of profiles || []) {
    const type = p.user_type || 'not_set'
    userTypeBreakdown[type] = (userTypeBreakdown[type] || 0) + 1
  }

  return {
    totalUsers,
    totalOrgs,
    totalTours,
    totalShows,
    totalExpenses,
    totalRevenue,
    totalMerchRevenue,
    totalFeedback: feedbackThreads.length,
    openFeedback,
    userTypeBreakdown,
  }
}

/**
 * Returns the last `days` of daily counts for charting on the admin
 * dashboard. Buckets: new users / new tours / new feedback threads.
 * Pads zero-rows for days with no activity so the line is continuous.
 */
export async function getAdminGrowthSeries(days = 30): Promise<
  { date: string; users: number; tours: number; feedback: number }[]
> {
  const supabase = createAdminClient()
  const since = new Date()
  since.setDate(since.getDate() - days + 1)
  since.setHours(0, 0, 0, 0)
  const sinceIso = since.toISOString()

  const [usersRes, toursRes, feedbackRes] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('tours').select('created_at').gte('created_at', sinceIso),
    supabase
      .from('feedback_threads')
      .select('created_at')
      .gte('created_at', sinceIso),
  ])

  const buckets = new Map<string, { users: number; tours: number; feedback: number }>()
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    buckets.set(key, { users: 0, tours: 0, feedback: 0 })
  }

  for (const u of usersRes.data?.users || []) {
    if (!u.created_at) continue
    const key = new Date(u.created_at).toISOString().slice(0, 10)
    const b = buckets.get(key)
    if (b) b.users++
  }
  for (const t of toursRes.data || []) {
    const key = new Date(t.created_at as string).toISOString().slice(0, 10)
    const b = buckets.get(key)
    if (b) b.tours++
  }
  for (const f of feedbackRes.data || []) {
    const key = new Date(f.created_at as string).toISOString().slice(0, 10)
    const b = buckets.get(key)
    if (b) b.feedback++
  }

  return Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    users: v.users,
    tours: v.tours,
    feedback: v.feedback,
  }))
}

export async function getAdminUsers() {
  const supabase = createAdminClient()

  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const users = authUsers?.users || []

  // Get profiles and org memberships
  const { data: profiles } = await supabase.from('user_profiles').select('*')
  const { data: orgMembers } = await supabase.from('org_members').select('*, organizations(name)')

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]))
  const orgMap = new Map((orgMembers || []).map((m) => [m.user_id, m]))

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    createdAt: u.created_at,
    lastSignIn: u.last_sign_in_at,
    profile: profileMap.get(u.id) || null,
    orgMembership: orgMap.get(u.id) || null,
  }))
}

export async function getActivityLogs(limit = 100) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
