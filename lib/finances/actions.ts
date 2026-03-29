'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createExpense(tourId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const date = formData.get('date') as string
  const category = formData.get('category') as string
  const amount = formData.get('amount') as string
  const description = formData.get('description') as string
  const showId = formData.get('show_id') as string
  const isTaxDeductible = formData.get('is_tax_deductible') === 'on'

  if (!date || !category || !amount) {
    return { error: 'Date, category, and amount are required' }
  }

  const { error } = await supabase
    .from('expenses')
    .insert({
      tour_id: tourId,
      show_id: showId || null,
      member_id: user.id,
      date,
      category,
      amount: parseFloat(amount),
      description: description || null,
      is_tax_deductible: isTaxDeductible,
    })

  if (error) return { error: error.message }

  revalidatePath(`/tours/${tourId}/finances`)
  redirect(`/tours/${tourId}/finances`)
}

export async function updateShowRevenue(showId: string, tourId: string, formData: FormData) {
  const supabase = await createClient()

  const guarantee = formData.get('guarantee') as string
  const ticketSales = formData.get('ticket_sales') as string
  const merchSales = formData.get('merch_sales') as string
  const otherRevenue = formData.get('other_revenue') as string
  const otherDescription = formData.get('other_revenue_description') as string

  const { error } = await supabase
    .from('show_revenue')
    .upsert({
      show_id: showId,
      guarantee: guarantee ? parseFloat(guarantee) : null,
      ticket_sales: ticketSales ? parseFloat(ticketSales) : null,
      merch_sales: merchSales ? parseFloat(merchSales) : null,
      other_revenue: otherRevenue ? parseFloat(otherRevenue) : null,
      other_revenue_description: otherDescription || null,
    })

  if (error) return { error: error.message }

  revalidatePath(`/tours/${tourId}/finances`)
  return { success: true }
}

export async function approveExpense(expenseId: string, tourId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('expenses')
    .update({ status: 'approved' })
    .eq('id', expenseId)

  if (error) return { error: error.message }

  revalidatePath(`/tours/${tourId}/finances`)
  return { success: true }
}

export async function deleteExpense(expenseId: string, tourId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)

  if (error) return { error: error.message }

  revalidatePath(`/tours/${tourId}/finances`)
  return { success: true }
}
