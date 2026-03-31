import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { getAdminDashboardStats } from '@/lib/admin/queries'
import { Users, Building2, Music, MapPin, DollarSign, ShoppingBag, MessageSquare, TrendingUp } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin Dashboard', robots: { index: false } }

function StatCard({ label, value, icon: Icon, color = 'text-text-muted' }: {
  label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color?: string
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return <main id="main-content" className="mx-auto max-w-4xl px-4 py-8"><p className="text-text-secondary">Admin access required.</p></main>
  }

  const stats = await getAdminDashboardStats()
  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-text-secondary">Platform overview and metrics.</p>
        </div>
        <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">Super Admin</span>
      </div>

      {/* Platform stats */}
      <h2 className="mb-4 text-lg font-semibold">Platform</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={stats.totalUsers} icon={Users} color="text-primary-600 dark:text-primary-400" />
        <StatCard label="Organizations" value={stats.totalOrgs} icon={Building2} color="text-primary-600 dark:text-primary-400" />
        <StatCard label="Tours" value={stats.totalTours} icon={Music} color="text-primary-600 dark:text-primary-400" />
        <StatCard label="Shows" value={stats.totalShows} icon={MapPin} color="text-primary-600 dark:text-primary-400" />
      </div>

      {/* Financial stats */}
      <h2 className="mb-4 text-lg font-semibold">Financials (All Orgs)</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Revenue Tracked" value={fmt(stats.totalRevenue)} icon={TrendingUp} color="text-success-600 dark:text-success-500" />
        <StatCard label="Total Expenses Tracked" value={fmt(stats.totalExpenses)} icon={DollarSign} color="text-error-500" />
        <StatCard label="Merch Revenue" value={fmt(stats.totalMerchRevenue)} icon={ShoppingBag} color="text-primary-600 dark:text-primary-400" />
      </div>

      {/* User type breakdown */}
      <h2 className="mb-4 text-lg font-semibold">User Types</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(stats.userTypeBreakdown)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => (
            <div key={type} className="flex items-center justify-between rounded-lg border border-border-default bg-surface-raised px-4 py-3">
              <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
              <span className="text-sm font-bold">{count}</span>
            </div>
          ))}
      </div>

      {/* Feedback stats */}
      <h2 className="mb-4 text-lg font-semibold">Feedback</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard label="Total Feedback Threads" value={stats.totalFeedback} icon={MessageSquare} />
        <StatCard label="Open / In Progress" value={stats.openFeedback} icon={MessageSquare} color={stats.openFeedback > 0 ? 'text-warning-600 dark:text-warning-500' : 'text-text-muted'} />
      </div>

      {/* Product Analytics */}
      <h2 className="mb-4 text-lg font-semibold">Product Analytics</h2>
      <div className="mb-8 rounded-xl border border-border-default bg-surface-raised p-6">
        {process.env.NEXT_PUBLIC_POSTHOG_KEY ? (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              PostHog is active. View detailed analytics including funnels, session recordings, and user journeys on your PostHog dashboard.
            </p>
            <div className="flex gap-3">
              <a
                href={`${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com'}/project`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Open PostHog Dashboard
              </a>
              <a
                href="https://vercel.com/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt"
              >
                Vercel Analytics
              </a>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-alt p-3 text-center">
                <p className="text-xs text-text-muted">Tracking</p>
                <p className="mt-1 text-sm font-semibold">Page Views, Events, Sessions</p>
              </div>
              <div className="rounded-lg bg-surface-alt p-3 text-center">
                <p className="text-xs text-text-muted">Funnels</p>
                <p className="mt-1 text-sm font-semibold">Signup → Onboard → Pay</p>
              </div>
              <div className="rounded-lg bg-surface-alt p-3 text-center">
                <p className="text-xs text-text-muted">Recordings</p>
                <p className="mt-1 text-sm font-semibold">Session Replays</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-sm text-text-secondary">PostHog is not configured yet. Set up product analytics to track user behavior, funnels, and session recordings.</p>
            <p className="text-xs text-text-muted">Add NEXT_PUBLIC_POSTHOG_KEY to your environment variables. See Help Center → PostHog Setup for instructions.</p>
          </div>
        )}
      </div>
    </main>
  )
}
