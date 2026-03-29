import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, DollarSign, Star, Zap, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { getLifetimeSalesStats, getAllSubscriptions, getPromoCodes } from '@/lib/subscriptions/queries'

export const metadata: Metadata = { title: 'Subscriptions Admin', robots: { index: false } }

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return <main id="main-content" className="p-8"><p className="text-text-secondary">Admin access required.</p></main>
  }

  const [stats, subscriptions, promos] = await Promise.all([
    getLifetimeSalesStats(),
    getAllSubscriptions(),
    getPromoCodes(),
  ])

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-text-secondary">Lifetime sales, annual subscriptions, and promo codes.</p>
        </div>
        <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">Super Admin</span>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Lifetime Sold</p>
            <Star className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.paid_lifetime_count} <span className="text-sm font-normal text-text-muted">/ 100</span></p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Remaining</p>
            <Star className="h-5 w-5 text-warning-600 dark:text-warning-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.lifetime_remaining}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Active Annual</p>
            <Zap className="h-5 w-5 text-success-600 dark:text-success-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.active_annual_count}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Total Revenue</p>
            <DollarSign className="h-5 w-5 text-success-600 dark:text-success-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(Number(stats.total_revenue))}</p>
        </div>
      </div>

      <p className="mb-8 text-sm text-text-muted">
        {stats.annual_unlocked
          ? '✅ Annual subscriptions are unlocked (100+ lifetime sold).'
          : `Annual subscriptions unlock after 100 paid lifetime memberships (${stats.paid_lifetime_count}/100).`
        }
      </p>

      {/* Promo Codes */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Promo Codes ({promos.length})</h2>
          <Link href="/admin/promos/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" aria-hidden="true" /> New Promo
          </Link>
        </div>

        {promos.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface-raised p-6 text-center">
            <Tag className="mx-auto mb-2 h-8 w-8 text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">No promo codes yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {promos.map((promo) => (
              <div key={promo.id} className="flex items-center justify-between rounded-lg border border-border-default bg-surface-raised p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-surface-alt px-2 py-0.5 text-sm font-bold">{promo.code}</code>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${promo.active ? 'bg-success-500/20 text-success-600 dark:text-success-500' : 'bg-text-muted/20 text-text-muted'}`}>
                      {promo.active ? 'Active' : 'Inactive'}
                    </span>
                    {promo.is_lifetime_grant && (
                      <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">Grants Lifetime</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {promo.discount_type === 'percentage' ? `${promo.discount_value}% off` : `$${promo.discount_value} off`}
                    {' '}&bull; {promo.applies_to}
                    {promo.max_uses && ` &bull; ${promo.times_used}/${promo.max_uses} used`}
                    {promo.description && ` &bull; ${promo.description}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscriptions */}
      <h2 className="mb-4 text-lg font-semibold">All Subscriptions ({subscriptions.length})</h2>
      {subscriptions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs text-text-muted">
                <th className="pb-2 pr-4" scope="col">User</th>
                <th className="pb-2 pr-4" scope="col">Type</th>
                <th className="pb-2 pr-4" scope="col">Amount</th>
                <th className="pb-2 pr-4" scope="col">Status</th>
                <th className="pb-2" scope="col">Started</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border-default">
                  <td className="py-2 pr-4 font-medium">{(sub.user_profiles as { display_name: string | null })?.display_name || 'Unknown'}</td>
                  <td className="py-2 pr-4 capitalize">{sub.type}</td>
                  <td className="py-2 pr-4">{fmt(Number(sub.amount))}</td>
                  <td className="py-2 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sub.status === 'active' ? 'bg-success-500/20 text-success-600 dark:text-success-500' : 'bg-text-muted/20 text-text-muted'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-2 text-text-muted">{new Date(sub.started_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
