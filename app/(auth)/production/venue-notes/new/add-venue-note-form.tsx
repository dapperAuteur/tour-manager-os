'use client'

import { useState } from 'react'
import { addVenueNote } from '@/lib/production/actions'

export function AddVenueNoteForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await addVenueNote(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="venue_name" className="mb-1 block text-sm font-medium">Venue Name <span className="text-error-500">*</span></label>
        <input id="venue_name" name="venue_name" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="The Fox Theatre" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium">City</label>
          <input id="city" name="city" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Atlanta" />
        </div>
        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium">State</label>
          <input id="state" name="state" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="GA" />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">Category</label>
          <select id="category" name="category" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="general">General</option>
            <option value="load_in">Load In</option>
            <option value="parking">Parking</option>
            <option value="stage">Stage</option>
            <option value="sound">Sound</option>
            <option value="catering">Catering</option>
            <option value="dressing_room">Dressing Room</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium">Note <span className="text-error-500">*</span></label>
        <textarea id="content" name="content" rows={4} required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Loading dock is around back. Bring extra XLR cables — they only have 8..." />
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save Note'}</button>
    </form>
  )
}
