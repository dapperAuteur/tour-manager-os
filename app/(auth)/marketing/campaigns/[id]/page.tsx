import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Users, Eye, MousePointer, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SendCampaignButton } from './send-button'

export const metadata: Metadata = { title: 'Campaign Detail', robots: { index: false } }

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign, error } = await supabase
    .from('email_campaigns')
    .select('*, email_lists(name)')
    .eq('id', id)
    .single()

  if (error || !campaign) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-text-secondary">Campaign not found.</p>
      </main>
    )
  }

  const listName = (campaign.email_lists as { name: string } | null)?.name
  const isSent = campaign.status === 'sent'
  const openRate = campaign.recipients_count && campaign.recipients_count > 0
    ? Math.round(((campaign.opened_count || 0) / campaign.recipients_count) * 100)
    : 0
  const clickRate = campaign.recipients_count && campaign.recipients_count > 0
    ? Math.round(((campaign.clicked_count || 0) / campaign.recipients_count) * 100)
    : 0

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/marketing" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Marketing</Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{campaign.subject}</h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
            {listName && <span>List: {listName}</span>}
            <span className="capitalize">{campaign.status}</span>
            {campaign.sent_at && <span>Sent {new Date(campaign.sent_at).toLocaleDateString()}</span>}
          </div>
        </div>
        {!isSent && campaign.status !== 'sending' && (
          <SendCampaignButton campaignId={id} />
        )}
      </div>

      {/* Analytics */}
      {isSent && (
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border-default bg-surface-raised p-4 text-center">
            <Users className="mx-auto mb-1 h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <p className="text-xl font-bold">{campaign.recipients_count || 0}</p>
            <p className="text-xs text-text-muted">Recipients</p>
          </div>
          <div className="rounded-xl border border-border-default bg-surface-raised p-4 text-center">
            <Eye className="mx-auto mb-1 h-5 w-5 text-success-600 dark:text-success-500" aria-hidden="true" />
            <p className="text-xl font-bold">{campaign.opened_count || 0}</p>
            <p className="text-xs text-text-muted">Opens ({openRate}%)</p>
          </div>
          <div className="rounded-xl border border-border-default bg-surface-raised p-4 text-center">
            <MousePointer className="mx-auto mb-1 h-5 w-5 text-warning-600 dark:text-warning-500" aria-hidden="true" />
            <p className="text-xl font-bold">{campaign.clicked_count || 0}</p>
            <p className="text-xs text-text-muted">Clicks ({clickRate}%)</p>
          </div>
          <div className="rounded-xl border border-border-default bg-surface-raised p-4 text-center">
            <Clock className="mx-auto mb-1 h-5 w-5 text-text-muted" aria-hidden="true" />
            <p className="text-xl font-bold">{campaign.sent_at ? new Date(campaign.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
            <p className="text-xs text-text-muted">Send Time</p>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-muted">
          <Mail className="h-4 w-4" aria-hidden="true" /> Email Preview
        </h2>
        <div className="rounded-lg border border-border-default bg-surface p-6">
          <p className="mb-4 text-sm font-semibold">{campaign.subject}</p>
          <div className="whitespace-pre-wrap text-sm text-text-secondary">{campaign.content}</div>
          <hr className="my-4 border-border-default" />
          <p className="text-xs text-text-muted">Sent via Tour Manager OS</p>
        </div>
      </div>
    </main>
  )
}
