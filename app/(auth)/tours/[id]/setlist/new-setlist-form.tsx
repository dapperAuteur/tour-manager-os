'use client'

import { useState } from 'react'
import { createSetlist } from '@/lib/setlist/actions'

export function NewSetlistForm({ tourId }: { tourId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createSetlist(tourId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
    else { setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">Name <span className="text-error-500">*</span></label>
        <input id="name" name="name" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Main Set, Acoustic Set..." />
      </div>

      <div>
        <label htmlFor="show_id" className="mb-1 block text-sm font-medium">Show ID (optional)</label>
        <input id="show_id" name="show_id" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Link to a specific show" />
      </div>

      <button type="submit" disabled={loading} className="self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Setlist'}</button>
    </form>
  )
}
