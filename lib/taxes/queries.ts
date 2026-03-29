import { createClient } from '@/lib/supabase/server'

export async function getStateIncome(userId: string, taxYear: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('state_income')
    .select('*')
    .eq('user_id', userId)
    .eq('tax_year', taxYear)
    .order('performance_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getDeductionCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deduction_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getPerDiemLog(userId: string, taxYear: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('per_diem_log')
    .select('*')
    .eq('user_id', userId)
    .eq('tax_year', taxYear)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getTaxSummary(userId: string, taxYear: number) {
  const supabase = await createClient()

  // State income
  const { data: stateIncome } = await supabase
    .from('state_income')
    .select('state, gross_income')
    .eq('user_id', userId)
    .eq('tax_year', taxYear)

  // Expenses marked as tax deductible
  const { data: expenses } = await supabase
    .from('expenses')
    .select('category, amount, date, description')
    .eq('member_id', userId)
    .eq('is_tax_deductible', true)

  // Per diem
  const { data: perDiem } = await supabase
    .from('per_diem_log')
    .select('rate, received_amount')
    .eq('user_id', userId)
    .eq('tax_year', taxYear)

  // Aggregate state income
  const stateMap: Record<string, number> = {}
  for (const s of stateIncome || []) {
    stateMap[s.state] = (stateMap[s.state] || 0) + Number(s.gross_income)
  }

  // Aggregate deductions by category
  const deductionMap: Record<string, number> = {}
  const yearStr = String(taxYear)
  for (const e of expenses || []) {
    if (e.date.startsWith(yearStr)) {
      deductionMap[e.category] = (deductionMap[e.category] || 0) + Number(e.amount)
    }
  }

  const totalIncome = Object.values(stateMap).reduce((a, b) => a + b, 0)
  const totalDeductions = Object.values(deductionMap).reduce((a, b) => a + b, 0)
  const totalPerDiem = (perDiem || []).reduce((sum, p) => sum + Number(p.rate), 0)

  return {
    stateBreakdown: stateMap,
    deductionBreakdown: deductionMap,
    totalIncome,
    totalDeductions,
    totalPerDiem,
    statesPerformed: Object.keys(stateMap).length,
  }
}
