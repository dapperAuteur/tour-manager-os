'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addStateIncome(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const tourId = formData.get('tour_id') as string
  const showId = formData.get('show_id') as string
  const state = formData.get('state') as string
  const city = formData.get('city') as string
  const venueName = formData.get('venue_name') as string
  const performanceDate = formData.get('performance_date') as string
  const grossIncome = formData.get('gross_income') as string
  const taxYear = formData.get('tax_year') as string

  if (!state || !performanceDate || !grossIncome) {
    return { error: 'State, date, and income are required' }
  }

  const { error } = await supabase.from('state_income').insert({
    user_id: user.id,
    tour_id: tourId || null,
    show_id: showId || null,
    state,
    city: city || null,
    venue_name: venueName || null,
    performance_date: performanceDate,
    gross_income: parseFloat(grossIncome),
    tax_year: parseInt(taxYear) || new Date().getFullYear(),
  })

  if (error) return { error: error.message }
  revalidatePath('/me/taxes')
  return { success: true }
}

export async function generateTaxExportCsv(userId: string, taxYear: number) {
  const { getTaxSummary, getStateIncome, getDeductionCategories } = await import('./queries')

  const summary = await getTaxSummary(userId, taxYear)
  const stateRecords = await getStateIncome(userId, taxYear)
  const categories = await getDeductionCategories()
  const catMap = new Map(categories.map((c) => [c.id, c.name]))

  const lines: string[] = []

  // Header
  lines.push(`Tour Manager OS — Tax Summary for ${taxYear}`)
  lines.push('')

  // Income summary
  lines.push('STATE INCOME SUMMARY')
  lines.push('State,Total Income')
  for (const [state, income] of Object.entries(summary.stateBreakdown).sort(([, a], [, b]) => b - a)) {
    lines.push(`${state},${income.toFixed(2)}`)
  }
  lines.push(`TOTAL,${summary.totalIncome.toFixed(2)}`)
  lines.push('')

  // Deduction summary
  lines.push('DEDUCTIONS SUMMARY')
  lines.push('Category,Total')
  for (const [cat, amount] of Object.entries(summary.deductionBreakdown).sort(([, a], [, b]) => b - a)) {
    lines.push(`${catMap.get(cat) || cat},${amount.toFixed(2)}`)
  }
  lines.push(`TOTAL DEDUCTIONS,${summary.totalDeductions.toFixed(2)}`)
  lines.push('')

  // Per diem
  lines.push(`TOTAL PER DIEM,${summary.totalPerDiem.toFixed(2)}`)
  lines.push('')

  // Detail records
  lines.push('STATE INCOME DETAIL')
  lines.push('Date,State,City,Venue,Gross Income')
  for (const r of stateRecords) {
    lines.push(`${r.performance_date},${r.state},${r.city || ''},${r.venue_name || ''},${Number(r.gross_income).toFixed(2)}`)
  }

  return lines.join('\n')
}
