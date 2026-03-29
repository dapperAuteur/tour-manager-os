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
  }
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
