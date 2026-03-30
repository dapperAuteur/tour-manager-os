'use client'

import { useState } from 'react'
import { uploadAudio } from '@/lib/audio/actions'

export function NewAudioForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await uploadAudio(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">Title <span className="text-error-500">*</span></label>
        <input id="title" name="title" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Rehearsal recording, demo, mix..." />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={3} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Notes about this recording..." />
      </div>

      <div>
        <label htmlFor="file_url" className="mb-1 block text-sm font-medium">File URL <span className="text-error-500">*</span></label>
        <input id="file_url" name="file_url" type="url" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="https://..." />
      </div>

      <div>
        <label htmlFor="duration_seconds" className="mb-1 block text-sm font-medium">Duration (seconds)</label>
        <input id="duration_seconds" name="duration_seconds" type="number" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="180" />
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Uploading...' : 'Upload Audio'}</button>
    </form>
  )
}
