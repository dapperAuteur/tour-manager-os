import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getUserSubscription(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data
}

export async function getLifetimeSalesStats() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('lifetime_sales_stats' as 'subscriptions')
    .select('*')
    .single()

  // Fallback if view doesn't work via PostgREST
  if (!data) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('type, status, amount')

    const allSubs = subs || []
    const paidLifetime = allSubs.filter((s) => s.type === 'lifetime' && s.status === 'active').length
    const activeAnnual = allSubs.filter((s) => s.type === 'annual' && s.status === 'active').length
    const totalRev = allSubs.filter((s) => s.status === 'active').reduce((sum, s) => sum + Number(s.amount), 0)

    return {
      paid_lifetime_count: paidLifetime,
      active_annual_count: activeAnnual,
      total_revenue: totalRev,
      lifetime_remaining: 100 - paidLifetime,
      annual_unlocked: paidLifetime >= 100,
    }
  }

  return { ...data, annual_unlocked: (data as Record<string, number>).paid_lifetime_count >= 100 }
}

export async function getAllSubscriptions() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, user_profiles:user_id(display_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPromoCodes() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function validatePromoCode(code: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single()

  if (!data) return null
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  if (data.max_uses && data.times_used >= data.max_uses) return null

  return data
}
