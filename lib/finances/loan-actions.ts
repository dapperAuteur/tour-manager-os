'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

export async function createMemberLoan(formData: FormData): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const direction = (formData.get('direction') as string | null) || 'i_lent'
  const counterpartyId = ((formData.get('counterparty_id') as string | null) || '').trim()
  const amountRaw = ((formData.get('amount') as string | null) || '').trim()
  const tourIdRaw = ((formData.get('tour_id') as string | null) || '').trim()
  const reason = ((formData.get('reason') as string | null) || '').trim()

  if (!counterpartyId) return { error: 'Pick the other person.' }
  if (counterpartyId === user.id) return { error: 'You can\'t loan to yourself.' }
  const amount = Number(amountRaw)
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Amount must be a positive number.' }
  }

  const lender_id = direction === 'i_lent' ? user.id : counterpartyId
  const borrower_id = direction === 'i_lent' ? counterpartyId : user.id

  const { error } = await supabase.from('member_loans').insert({
    tour_id: tourIdRaw || null,
    lender_id,
    borrower_id,
    amount,
    reason: reason || null,
    created_by: user.id,
  })
  if (error) return { error: error.message }

  revalidatePath('/me/finances')
  return { ok: true }
}

export async function markLoanPaid(
  loanId: string,
  paidMethod: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('member_loans')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      paid_method: paidMethod.trim() || null,
    })
    .eq('id', loanId)
  if (error) return { error: error.message }
  revalidatePath('/me/finances')
  return { ok: true }
}

export async function unmarkLoanPaid(loanId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('member_loans')
    .update({ status: 'open', paid_at: null, paid_method: null })
    .eq('id', loanId)
  if (error) return { error: error.message }
  revalidatePath('/me/finances')
  return { ok: true }
}

export async function deleteOpenLoan(loanId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('member_loans')
    .delete()
    .eq('id', loanId)
    .eq('status', 'open')
  if (error) return { error: error.message }
  revalidatePath('/me/finances')
  return { ok: true }
}
