import { createClient } from '@/lib/supabase/server'

export async function getTourFinances(tourId: string) {
  const supabase = await createClient()

  const [expensesRes, revenueRes, showsRes] = await Promise.all([
    supabase
      .from('expenses')
      .select('*')
      .eq('tour_id', tourId)
      .order('date', { ascending: false }),
    supabase
      .from('show_revenue')
      .select('*, shows(date, city, state, venue_name)')
      .in('show_id', (
        await supabase.from('shows').select('id').eq('tour_id', tourId)
      ).data?.map((s) => s.id) || []),
    supabase
      .from('shows')
      .select('id, date, city, state, venue_name')
      .eq('tour_id', tourId)
      .order('date', { ascending: true }),
  ])

  const expenses = expensesRes.data || []
  const revenue = revenueRes.data || []
  const shows = showsRes.data || []

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalRevenue = revenue.reduce((sum, r) => sum + Number(r.total_revenue || 0), 0)

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {}
  for (const e of expenses) {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + Number(e.amount)
  }

  return {
    expenses,
    revenue,
    shows,
    totalExpenses,
    totalRevenue,
    netProfit: totalRevenue - totalExpenses,
    expensesByCategory,
  }
}

export async function getMemberFinances(userId: string) {
  const supabase = await createClient()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, tours(name, artist_name)')
    .eq('member_id', userId)
    .order('date', { ascending: false })

  const { data: payouts } = await supabase
    .from('member_payouts')
    .select('*, settlements(tour_id, shows(date, city, venue_name))')
    .eq('member_id', userId)
    .order('created_at', { ascending: false })

  const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0)
  const totalPaid = (payouts || []).filter((p) => p.paid).reduce((sum, p) => sum + Number(p.amount), 0)
  const totalOwed = (payouts || []).filter((p) => !p.paid).reduce((sum, p) => sum + Number(p.amount), 0)
  const taxDeductible = (expenses || []).filter((e) => e.is_tax_deductible).reduce((sum, e) => sum + Number(e.amount), 0)

  return {
    expenses: expenses || [],
    payouts: payouts || [],
    totalExpenses,
    totalPaid,
    totalOwed,
    taxDeductible,
  }
}
