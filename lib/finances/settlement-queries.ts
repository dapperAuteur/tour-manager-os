import { createAdminClient } from '@/lib/supabase/admin'
import type { SettlementInput } from './settlement-pdf'

/**
 * Gathers every number we need to render a one-page tour settlement
 * from the per-table sources of truth. Read-only.
 */
export async function gatherSettlement(
  tourId: string,
): Promise<SettlementInput | null> {
  const admin = createAdminClient()

  const { data: tour } = await admin
    .from('tours')
    .select('id, name, artist_name, start_date, end_date')
    .eq('id', tourId)
    .maybeSingle()
  if (!tour) return null

  // Shows on the tour
  const { data: showRows } = await admin
    .from('shows')
    .select('id')
    .eq('tour_id', tourId)
  const showIds = (showRows || []).map((s) => s.id)

  // Ticket sales aggregate (sum of amount_paid across non-refunded tickets
  // tied to one of the tour's shows).
  let ticketRevenueCents = 0
  let ticketsSold = 0
  if (showIds.length > 0) {
    const { data: ticketRows } = await admin
      .from('tickets')
      .select('amount_paid, status')
      .in('show_id', showIds)
    for (const row of ticketRows || []) {
      if (row.status === 'refunded' || row.status === 'void') continue
      ticketRevenueCents += Math.round(Number(row.amount_paid || 0) * 100)
      ticketsSold++
    }
  }

  // Merch sales sum (per the merch_sales table tied to the tour).
  let merchRevenueCents = 0
  const { data: merchRows } = await admin
    .from('merch_sales')
    .select('total')
    .eq('tour_id', tourId)
  for (const row of merchRows || []) {
    merchRevenueCents += Math.round(Number(row.total || 0) * 100)
  }

  // Guarantees from show_revenue rows.
  let guaranteesCents = 0
  if (showIds.length > 0) {
    const { data: revenueRows } = await admin
      .from('show_revenue')
      .select('guarantee')
      .in('show_id', showIds)
    for (const row of revenueRows || []) {
      guaranteesCents += Math.round(Number(row.guarantee || 0) * 100)
    }
  }

  // Expenses by category for the tour.
  const expensesMap = new Map<string, number>()
  const { data: expenseRows } = await admin
    .from('expenses')
    .select('category, amount')
    .eq('tour_id', tourId)
  let totalExpensesCents = 0
  for (const row of expenseRows || []) {
    const cents = Math.round(Number(row.amount || 0) * 100)
    expensesMap.set(
      row.category,
      (expensesMap.get(row.category) || 0) + cents,
    )
    totalExpensesCents += cents
  }
  const expensesByCategory = Array.from(expensesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, cents]) => ({ category, cents }))

  // Revenue splits with their allocation against the (revenue - expenses) net.
  const { data: splitRows } = await admin
    .from('tour_revenue_splits')
    .select(
      `id, percent_basis_points, role,
       user_profiles:payee_user_id(display_name)`,
    )
    .eq('tour_id', tourId)
    .eq('active', true)
  const net =
    ticketRevenueCents +
    merchRevenueCents +
    guaranteesCents -
    totalExpensesCents
  const splits = (splitRows || []).map((s) => {
    const profile = s.user_profiles as unknown as
      | { display_name: string | null }
      | null
    const payee = profile?.display_name || 'Member'
    return {
      payee,
      role: (s.role as string | null) ?? null,
      percentBasisPoints: s.percent_basis_points as number,
      cents: Math.round((net * (s.percent_basis_points as number)) / 10000),
    }
  })

  // Actual Stripe transfers routed (audit trail of payouts).
  const { data: transferRows } = await admin
    .from('tour_split_transfers')
    .select(
      `amount_cents, status,
       split:split_id(user_profiles:payee_user_id(display_name))`,
    )
    .eq('tour_id', tourId)
  const transfers = (transferRows || []).map((t) => {
    const split = t.split as unknown as
      | {
          user_profiles: { display_name: string | null } | null
        }
      | null
    return {
      payee: split?.user_profiles?.display_name || 'Recipient',
      cents: t.amount_cents as number,
      status: t.status as string,
    }
  })

  return {
    tourName: tour.name as string,
    artistName: (tour.artist_name as string | null) || '',
    startDate: (tour.start_date as string | null) ?? null,
    endDate: (tour.end_date as string | null) ?? null,
    showCount: showIds.length,
    ticketsSold,
    ticketRevenueCents,
    merchRevenueCents,
    guaranteesCents,
    expensesByCategory,
    totalExpensesCents,
    splits,
    transfers,
    generatedAt: new Date(),
  }
}
