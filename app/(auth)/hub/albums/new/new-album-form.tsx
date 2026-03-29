'use client'

import { useState } from 'react'
import { createAlbum } from '@/lib/hub/actions'

export function NewAlbumForm({ orgId, tours }: { orgId: string; tours: { id: string; name: string }[] }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createAlbum(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">Album Title <span className="text-error-500">*</span></label>
        <input id="title" name="title" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Summer Tour 2026 Photos" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={2} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Behind the scenes and show moments" />
      </div>

      {tours.length > 0 && (
        <div>
          <label htmlFor="tour_id" className="mb-1 block text-sm font-medium">Tour (optional)</label>
          <select id="tour_id" name="tour_id" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="">No specific tour</option>
            {tours.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Album'}</button>
    </form>
  )
}
