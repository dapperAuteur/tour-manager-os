'use client'

import { useState } from 'react'
import { createCampaign } from '@/lib/marketing/actions'

interface List { id: string; name: string }

export function NewCampaignForm({ orgId, lists }: { orgId: string; lists: List[] }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createCampaign(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium">Subject <span className="text-error-500">*</span></label>
        <input id="subject" name="subject" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Summer tour dates announced!" />
      </div>

      {lists.length > 0 && (
        <div>
          <label htmlFor="list_id" className="mb-1 block text-sm font-medium">Send To</label>
          <select id="list_id" name="list_id" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="">All subscribers</option>
            {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium">Content <span className="text-error-500">*</span></label>
        <textarea id="content" name="content" rows={8} required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Write your email content..." />
      </div>

      <div>
        <label htmlFor="scheduled_at" className="mb-1 block text-sm font-medium">Schedule (optional)</label>
        <input id="scheduled_at" name="scheduled_at" type="datetime-local" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        <p className="mt-1 text-xs text-text-muted">Leave empty to save as draft.</p>
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save Campaign'}</button>
    </form>
  )
}
