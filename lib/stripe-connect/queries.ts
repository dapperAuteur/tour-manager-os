import { createClient } from '@/lib/supabase/server'

export interface ConnectedAccount {
  org_id: string
  stripe_account_id: string
  charges_enabled: boolean
  payouts_enabled: boolean
  onboarding_complete: boolean
  country: string | null
  last_status_refresh_at: string | null
}

export async function getConnectedAccount(
  orgId: string,
): Promise<ConnectedAccount | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stripe_connected_accounts')
    .select(
      'org_id, stripe_account_id, charges_enabled, payouts_enabled, onboarding_complete, country, last_status_refresh_at',
    )
    .eq('org_id', orgId)
    .maybeSingle()
  return (data as ConnectedAccount | null) ?? null
}

export interface RevenueSplitRow {
  id: string
  tour_id: string
  payee_user_id: string
  payee_name: string | null
  stripe_account_id: string | null
  percent_basis_points: number
  role: string | null
  active: boolean
}

export async function listRevenueSplits(
  tourId: string,
): Promise<RevenueSplitRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tour_revenue_splits')
    .select(
      `id, tour_id, payee_user_id, stripe_account_id, percent_basis_points,
       role, active, user_profiles:payee_user_id(display_name)`,
    )
    .eq('tour_id', tourId)
    .order('percent_basis_points', { ascending: false })

  return (data || []).map((row) => ({
    id: row.id,
    tour_id: row.tour_id,
    payee_user_id: row.payee_user_id,
    payee_name:
      (row.user_profiles as unknown as { display_name: string | null } | null)
        ?.display_name ?? null,
    stripe_account_id: row.stripe_account_id,
    percent_basis_points: row.percent_basis_points,
    role: row.role,
    active: row.active,
  }))
}

export function basisPointsTotal(rows: RevenueSplitRow[]): number {
  return rows
    .filter((r) => r.active)
    .reduce((s, r) => s + r.percent_basis_points, 0)
}
