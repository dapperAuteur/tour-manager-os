import { createClient } from '@/lib/supabase/server'

export interface MemberLoan {
  id: string
  tour_id: string | null
  tour_name: string | null
  lender_id: string
  lender_name: string | null
  borrower_id: string
  borrower_name: string | null
  amount: number
  reason: string | null
  status: 'open' | 'paid'
  paid_at: string | null
  paid_method: string | null
  created_at: string
}

export interface LoansSummary {
  /** Loans where the current user is the borrower (you owe). */
  iOwe: MemberLoan[]
  /** Loans where the current user is the lender (owed to you). */
  owedToMe: MemberLoan[]
  /** Net dollar amount across all open loans (positive = others net owe you). */
  netOpen: number
}

export async function getMemberLoans(): Promise<LoansSummary | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: rows, error } = await supabase
    .from('member_loans')
    .select(`
      id, tour_id, lender_id, borrower_id, amount, reason,
      status, paid_at, paid_method, created_at,
      tours(name),
      lender:user_profiles!member_loans_lender_id_fkey(display_name),
      borrower:user_profiles!member_loans_borrower_id_fkey(display_name)
    `)
    .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
    .order('status')
    .order('created_at', { ascending: false })
  if (error || !rows) return { iOwe: [], owedToMe: [], netOpen: 0 }

  const mapped: MemberLoan[] = rows.map((row) => {
    const tour =
      (row.tours as unknown as { name: string } | null)?.name ?? null
    const lender =
      (row.lender as unknown as { display_name: string | null } | null)
        ?.display_name ?? null
    const borrower =
      (row.borrower as unknown as { display_name: string | null } | null)
        ?.display_name ?? null
    return {
      id: row.id,
      tour_id: row.tour_id,
      tour_name: tour,
      lender_id: row.lender_id,
      lender_name: lender,
      borrower_id: row.borrower_id,
      borrower_name: borrower,
      amount: Number(row.amount),
      reason: row.reason,
      status: row.status as 'open' | 'paid',
      paid_at: row.paid_at as string | null,
      paid_method: row.paid_method,
      created_at: row.created_at as string,
    }
  })

  const iOwe = mapped.filter((l) => l.borrower_id === user.id)
  const owedToMe = mapped.filter((l) => l.lender_id === user.id)
  const sum = (arr: MemberLoan[]) =>
    arr.filter((l) => l.status === 'open').reduce((s, l) => s + l.amount, 0)
  const netOpen = sum(owedToMe) - sum(iOwe)

  return { iOwe, owedToMe, netOpen }
}

export async function listTourCounterparties(): Promise<
  { user_id: string; display_name: string | null }[]
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  // Anyone in a tour the user has access to.
  const { data: members } = await supabase
    .from('tour_members')
    .select('user_id, user_profiles:user_id(display_name)')
  const seen = new Map<string, string | null>()
  for (const m of members || []) {
    if (!m.user_id || m.user_id === user.id) continue
    const name =
      (m.user_profiles as unknown as { display_name: string | null } | null)
        ?.display_name ?? null
    if (!seen.has(m.user_id)) seen.set(m.user_id, name)
  }
  return Array.from(seen.entries()).map(([user_id, display_name]) => ({
    user_id,
    display_name,
  }))
}

export async function listAccessibleTours(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tours')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(50)
  return (data || []) as { id: string; name: string }[]
}
