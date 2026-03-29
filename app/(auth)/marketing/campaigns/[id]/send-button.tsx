'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { sendCampaign } from '@/lib/email/send-campaign'

export function SendCampaignButton({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string; count?: number; message?: string } | null>(null)

  async function handleSend() {
    if (!confirm('Send this campaign to all subscribers? This cannot be undone.')) return
    setLoading(true)
    const res = await sendCampaign(campaignId)
    setResult(res)
    setLoading(false)
  }

  if (result?.success) {
    return (
      <div className="rounded-lg bg-success-500/10 px-4 py-2 text-sm text-success-600 dark:text-success-500">
        Sent to {result.count} subscriber{result.count !== 1 ? 's' : ''}.
        {result.message && <p className="text-xs">{result.message}</p>}
      </div>
    )
  }

  return (
    <div>
      {result?.error && (
        <p className="mb-2 text-xs text-error-500">{result.error}</p>
      )}
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {loading ? 'Sending...' : 'Send Now'}
      </button>
    </div>
  )
}
