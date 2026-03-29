'use client'

import { useState } from 'react'
import { createPracticeSession } from '@/lib/hub/actions'

export function NewPracticeForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createPracticeSession(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">Title <span className="text-error-500">*</span></label>
        <input id="title" name="title" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Band Rehearsal" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={2} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="What to prepare..." />
      </div>

      <div>
        <label htmlFor="location" className="mb-1 block text-sm font-medium">Location</label>
        <input id="location" name="location" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Studio A, 123 Music Lane" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium">Date <span className="text-error-500">*</span></label>
          <input id="date" name="date" type="date" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="start_time" className="mb-1 block text-sm font-medium">Start <span className="text-error-500">*</span></label>
          <input id="start_time" name="start_time" type="time" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="end_time" className="mb-1 block text-sm font-medium">End</label>
          <input id="end_time" name="end_time" type="time" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Scheduling...' : 'Schedule Practice'}</button>
    </form>
  )
}
