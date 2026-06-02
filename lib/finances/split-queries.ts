import { createClient } from '@/lib/supabase/server'

export interface ExpenseSplitRow {
  id: string
  expense_id: string
  user_id: string
  member_name: string | null
  share_amount: number
  status: 'owed' | 'settled' | 'waived'
  settled_method: string | null
  settled_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export async function listSplitsForExpense(
  expenseId: string,
): Promise<ExpenseSplitRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('expense_splits')
    .select(
      `id, expense_id, user_id, share_amount, status,
       settled_method, settled_at, notes, created_by, created_at,
       user_profiles:user_id(display_name)`,
    )
    .eq('expense_id', expenseId)
    .order('created_at', { ascending: true })
  return (data || []).map((r) => ({
    id: r.id,
    expense_id: r.expense_id,
    user_id: r.user_id,
    member_name:
      (r.user_profiles as unknown as { display_name: string | null } | null)
        ?.display_name ?? null,
    share_amount: Number(r.share_amount),
    status: r.status as ExpenseSplitRow['status'],
    settled_method: r.settled_method,
    settled_at: r.settled_at,
    notes: r.notes,
    created_by: r.created_by,
    created_at: r.created_at,
  }))
}

export interface UserSplitsSummary {
  /** What this user still owes other people who fronted expenses. */
  owedToOthers: {
    split_id: string
    expense_id: string
    expense_description: string | null
    expense_date: string
    expense_category: string
    creditor_user_id: string | null
    creditor_name: string | null
    share_amount: number
  }[]
  /** What other people still owe this user for expenses they fronted. */
  owedByOthers: {
    split_id: string
    expense_id: string
    expense_description: string | null
    expense_date: string
    expense_category: string
    debtor_user_id: string
    debtor_name: string | null
    share_amount: number
  }[]
  netOwed: number
}

/**
 * One-stop summary of every "owed" expense_split touching this user,
 * either as the share owner (they owe someone) or as the expense
 * filer (someone owes them). Drives the existing /me/finances page.
 */
export async function getUserSplitsSummary(
  userId: string,
): Promise<UserSplitsSummary> {
  const supabase = await createClient()

  const [{ data: owedToOthersRaw }, { data: owedByOthersRaw }] = await Promise.all([
    supabase
      .from('expense_splits')
      .select(
        `id, expense_id, share_amount,
         expenses:expense_id(date, category, description, member_id,
           filer:member_id(display_name))`,
      )
      .eq('user_id', userId)
      .eq('status', 'owed'),
    supabase
      .from('expense_splits')
      .select(
        `id, expense_id, user_id, share_amount,
         user_profiles:user_id(display_name),
         expenses:expense_id!inner(date, category, description, member_id)`,
      )
      .eq('status', 'owed')
      .eq('expenses.member_id', userId)
      .neq('user_id', userId),
  ])

  const owedToOthers = (owedToOthersRaw || []).map((row) => {
    const exp = row.expenses as unknown as {
      date: string
      category: string
      description: string | null
      member_id: string | null
      filer: { display_name: string | null } | null
    } | null
    return {
      split_id: row.id,
      expense_id: row.expense_id,
      expense_description: exp?.description ?? null,
      expense_date: exp?.date ?? '',
      expense_category: exp?.category ?? '',
      creditor_user_id: exp?.member_id ?? null,
      creditor_name: exp?.filer?.display_name ?? null,
      share_amount: Number(row.share_amount),
    }
  })

  const owedByOthers = (owedByOthersRaw || []).map((row) => {
    const exp = row.expenses as unknown as {
      date: string
      category: string
      description: string | null
    } | null
    return {
      split_id: row.id,
      expense_id: row.expense_id,
      expense_description: exp?.description ?? null,
      expense_date: exp?.date ?? '',
      expense_category: exp?.category ?? '',
      debtor_user_id: row.user_id,
      debtor_name:
        (row.user_profiles as unknown as { display_name: string | null } | null)
          ?.display_name ?? null,
      share_amount: Number(row.share_amount),
    }
  })

  const totalOwed = owedToOthers.reduce((s, r) => s + r.share_amount, 0)
  const totalOwedByOthers = owedByOthers.reduce((s, r) => s + r.share_amount, 0)
  return {
    owedToOthers,
    owedByOthers,
    netOwed: totalOwedByOthers - totalOwed,
  }
}
