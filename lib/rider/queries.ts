import { createClient } from '@/lib/supabase/server'

export interface RiderCheck {
  id: string
  show_id: string
  source_item_id: string | null
  category: string
  description: string
  expected_quantity: number | null
  actual_quantity: number | null
  status: 'pending' | 'delivered' | 'partial' | 'missing' | 'na'
  notes: string | null
  checked_at: string | null
}

export interface OrgRiderTemplateItem {
  id: string
  category: string
  description: string
  expected_quantity: number | null
  notes: string | null
}

export async function listShowRiderChecks(
  showId: string,
): Promise<RiderCheck[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('show_rider_checks')
    .select(
      'id, show_id, source_item_id, category, description, expected_quantity, actual_quantity, status, notes, checked_at',
    )
    .eq('show_id', showId)
    .order('category')
    .order('sort_order')
  return (data || []) as RiderCheck[]
}

export async function listOrgRiderTemplate(): Promise<OrgRiderTemplateItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (!membership?.org_id) return []

  const { data } = await supabase
    .from('org_rider_items')
    .select('id, category, description, expected_quantity, notes')
    .eq('org_id', membership.org_id)
    .order('category')
    .order('sort_order')
  return (data || []) as OrgRiderTemplateItem[]
}

/**
 * Roll-up status across all checks on a show. Useful for the show
 * page header chip.
 */
export interface RiderComplianceSummary {
  total: number
  delivered: number
  partial: number
  missing: number
  pending: number
}
export function summarize(checks: RiderCheck[]): RiderComplianceSummary {
  return checks.reduce(
    (acc, c) => {
      acc.total++
      if (c.status === 'delivered') acc.delivered++
      else if (c.status === 'partial') acc.partial++
      else if (c.status === 'missing') acc.missing++
      else if (c.status === 'pending') acc.pending++
      return acc
    },
    { total: 0, delivered: 0, partial: 0, missing: 0, pending: 0 },
  )
}
