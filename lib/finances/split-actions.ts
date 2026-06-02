'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

const VALID_METHODS = [
  'cash', 'venmo', 'zelle', 'paypal', 'cash_app', 'bank', 'other',
] as const

interface ShareInput {
  user_id: string
  share_amount: number
}

interface CreateSplitsInput {
  expenseId: string
  expenseAmount: number
  /** Whether to add unsplit remainder to the first share to make math round. */
  allowRoundingRemainder?: boolean
  shares: ShareInput[]
}

export async function createExpenseSplits(
  input: CreateSplitsInput,
): Promise<Result> {
  const { expenseId, expenseAmount, shares } = input
  if (!shares.length) return { error: 'Pick at least one member to split with.' }
  for (const s of shares) {
    if (!s.user_id) return { error: 'Each share needs a member.' }
    if (!Number.isFinite(s.share_amount) || s.share_amount <= 0) {
      return { error: 'Each share must be a positive amount.' }
    }
  }
  const total = shares.reduce((sum, s) => sum + s.share_amount, 0)
  // Allow tiny rounding drift (under 1 cent) for even-split math.
  if (Math.abs(total - expenseAmount) > 0.01) {
    return {
      error: `Shares total $${total.toFixed(2)} but the expense is $${expenseAmount.toFixed(2)}.`,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // Clear any existing splits for this expense — re-splitting is the
  // simplest way to "edit" splits.
  await supabase.from('expense_splits').delete().eq('expense_id', expenseId)

  const { error } = await supabase.from('expense_splits').insert(
    shares.map((s) => ({
      expense_id: expenseId,
      user_id: s.user_id,
      share_amount: s.share_amount,
      created_by: user.id,
    })),
  )
  if (error) return { error: error.message }

  revalidatePath(`/me/finances`)
  return { ok: true }
}

export async function markSplitSettled(
  splitId: string,
  method: string | null,
): Promise<Result> {
  const supabase = await createClient()
  const safeMethod =
    method && (VALID_METHODS as readonly string[]).includes(method) ? method : null
  const { error } = await supabase
    .from('expense_splits')
    .update({
      status: 'settled',
      settled_method: safeMethod,
      settled_at: new Date().toISOString(),
    })
    .eq('id', splitId)
  if (error) return { error: error.message }
  revalidatePath('/me/finances')
  return { ok: true }
}

export async function reopenSplit(splitId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('expense_splits')
    .update({
      status: 'owed',
      settled_method: null,
      settled_at: null,
    })
    .eq('id', splitId)
  if (error) return { error: error.message }
  revalidatePath('/me/finances')
  return { ok: true }
}

export async function deleteSplit(splitId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from('expense_splits').delete().eq('id', splitId)
  if (error) return { error: error.message }
  revalidatePath('/me/finances')
  return { ok: true }
}
