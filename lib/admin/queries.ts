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

export interface EngagementMetrics {
  dau: number
  wau: number
  mau: number
  /** DAU / MAU as a percentage. The classic "are users showing up daily?" gauge. */
  stickiness: number
  /** Daily-active-users count over the last 30 days for the bar chart. */
  dailySeries: { date: string; dau: number }[]
}

/**
 * DAU / WAU / MAU computed from the activity_log table. Each metric
 * counts distinct users with at least one logged action in the window.
 * Stickiness = DAU / MAU; touring teams should sit around 20% if the
 * app is part of the daily workflow.
 */
export async function getEngagementMetrics(): Promise<EngagementMetrics> {
  const supabase = createAdminClient()
  const now = new Date()
  const sub = (days: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - days)
    return d.toISOString()
  }

  const { data: rows } = await supabase
    .from('activity_log')
    .select('user_id, created_at')
    .gte('created_at', sub(30))
    .not('user_id', 'is', null)

  const dauSet = new Set<string>()
  const wauSet = new Set<string>()
  const mauSet = new Set<string>()
  const oneDay = 24 * 60 * 60 * 1000
  const sevenDays = 7 * oneDay

  const dailyBuckets = new Map<string, Set<string>>()
  for (let i = 0; i < 30; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    dailyBuckets.set(d.toISOString().slice(0, 10), new Set())
  }

  for (const row of rows || []) {
    if (!row.user_id) continue
    const ts = new Date(row.created_at as string).getTime()
    const age = now.getTime() - ts
    mauSet.add(row.user_id)
    if (age <= sevenDays) wauSet.add(row.user_id)
    if (age <= oneDay) dauSet.add(row.user_id)
    const key = new Date(row.created_at as string).toISOString().slice(0, 10)
    dailyBuckets.get(key)?.add(row.user_id)
  }

  const mau = mauSet.size
  const dau = dauSet.size
  const wau = wauSet.size
  const stickiness = mau > 0 ? Math.round((dau / mau) * 1000) / 10 : 0

  return {
    dau,
    wau,
    mau,
    stickiness,
    dailySeries: Array.from(dailyBuckets.entries()).map(([date, set]) => ({
      date,
      dau: set.size,
    })),
  }
}

export interface ModuleAdoption {
  moduleId: string
  moduleName: string
  enabledOrgs: number
  totalOrgs: number
  adoptionPercent: number
  activeMembers: number
}

/**
 * Per-module adoption: how many orgs have it enabled vs total orgs,
 * plus how many members have opted in. Drives the bar-chart variant
 * on the admin dashboard so we can see which modules are leading
 * (or starving) the product roadmap.
 */
export async function getModuleAdoption(): Promise<ModuleAdoption[]> {
  const supabase = createAdminClient()
  const [{ data: modules }, { data: orgModules }, { data: members }, totalOrgsRes] =
    await Promise.all([
      supabase.from('modules').select('id, name').order('name'),
      supabase.from('org_modules').select('module_id, enabled, org_id'),
      supabase
        .from('member_module_access')
        .select('module_id, granted')
        .eq('granted', true),
      supabase
        .from('organizations')
        .select('id', { count: 'exact', head: true }),
    ])
  const totalOrgs = totalOrgsRes.count || 0

  const enabledByModule = new Map<string, Set<string>>()
  for (const row of orgModules || []) {
    if (!row.enabled) continue
    const set = enabledByModule.get(row.module_id) || new Set<string>()
    set.add(row.org_id)
    enabledByModule.set(row.module_id, set)
  }
  const membersByModule = new Map<string, number>()
  for (const row of members || []) {
    membersByModule.set(
      row.module_id,
      (membersByModule.get(row.module_id) || 0) + 1,
    )
  }

  return (modules || []).map((m) => {
    const enabledOrgs = enabledByModule.get(m.id)?.size || 0
    return {
      moduleId: m.id,
      moduleName: m.name,
      enabledOrgs,
      totalOrgs,
      adoptionPercent:
        totalOrgs > 0 ? Math.round((enabledOrgs / totalOrgs) * 1000) / 10 : 0,
      activeMembers: membersByModule.get(m.id) || 0,
    }
  })
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
