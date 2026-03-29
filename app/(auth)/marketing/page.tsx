import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Plus, Users, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getMarketingDashboard } from '@/lib/marketing/queries'

export const metadata: Metadata = {
  title: 'Marketing',
  robots: { index: false },
}

const statusColors: Record<string, string> = {
  draft: 'bg-text-muted/20 text-text-muted',
  scheduled: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  sending: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  sent: 'bg-success-500/20 text-success-600 dark:text-success-500',
  failed: 'bg-error-500/20 text-error-500',
}

export default async function MarketingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-4 text-2xl font-bold">Marketing</h1>
        <p className="text-text-secondary">Create an organization first.</p>
      </main>
    )
  }

  const data = await getMarketingDashboard(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Marketing</h1>
        <div className="flex gap-2">
          <Link
            href="/marketing/lists/new"
            className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            New List
          </Link>
          <Link
            href="/marketing/campaigns/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <p className="text-sm text-text-muted">Subscribers</p>
          <p className="mt-2 text-2xl font-bold">{data.totalSubscribers.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <p className="text-sm text-text-muted">Lists</p>
          <p className="mt-2 text-2xl font-bold">{data.totalLists}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <p className="text-sm text-text-muted">Campaigns</p>
          <p className="mt-2 text-2xl font-bold">{data.totalCampaigns}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <p className="text-sm text-text-muted">Sent</p>
          <p className="mt-2 text-2xl font-bold">{data.sentCampaigns}</p>
        </div>
      </div>

      {/* Lists */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Email Lists</h2>
        {data.lists.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">No email lists yet. Create one to start collecting subscribers.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.lists.map((list) => {
              const subCount = Array.isArray(list.email_subscribers) ? list.email_subscribers.length : 0
              return (
                <div key={list.id} className="rounded-xl border border-border-default bg-surface-raised p-5">
                  <h3 className="font-semibold">{list.name}</h3>
                  {list.description && <p className="mt-1 text-sm text-text-secondary">{list.description}</p>}
                  <p className="mt-2 text-xs text-text-muted">{subCount} subscriber{subCount !== 1 ? 's' : ''}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Campaigns */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Campaigns</h2>
        {data.campaigns.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
            <Mail className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">No campaigns yet. Create one to reach your fans.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.campaigns.map((campaign) => (
              <Link key={campaign.id} href={`/marketing/campaigns/${campaign.id}`} className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-4 transition-all hover:border-primary-500/50 hover:shadow-sm">
                <div>
                  <h3 className="font-medium">{campaign.subject}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                    {(campaign.email_lists as { name: string } | null)?.name && (
                      <span>List: {(campaign.email_lists as { name: string }).name}</span>
                    )}
                    <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {campaign.status === 'sent' && (
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <BarChart3 className="h-3 w-3" aria-hidden="true" />
                      {campaign.recipients_count} sent
                    </div>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[campaign.status]}`}>
                    {campaign.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
