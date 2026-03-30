'use client'

import { useState } from 'react'
import { addTimelineBlock } from '@/lib/packages/actions'

interface Act { id: string; act_name: string }

export function AddTimelineBlockForm({ packageId, date, acts }: { packageId: string; date: string; acts: Act[] }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSuccess(false)
    setLoading(true)
    const result = await addTimelineBlock(packageId, date, formData)
    if (result?.error) setError(result.error)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}
      {success && <div role="status" className="rounded-lg bg-success-500/10 p-3 text-sm text-success-600 dark:text-success-500">Block added!</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="start_time" className="mb-1 block text-sm font-medium">Start Time <span className="text-error-500">*</span></label>
          <input id="start_time" name="start_time" type="time" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="end_time" className="mb-1 block text-sm font-medium">End Time</label>
          <input id="end_time" name="end_time" type="time" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="block_type" className="mb-1 block text-sm font-medium">Type <span className="text-error-500">*</span></label>
          <select id="block_type" name="block_type" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="load_in">Load In</option>
            <option value="soundcheck">Soundcheck</option>
            <option value="changeover">Changeover</option>
            <option value="performance">Performance</option>
            <option value="doors">Doors</option>
            <option value="meet_greet">Meet & Greet</option>
            <option value="break">Break</option>
            <option value="curfew">Curfew</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="label" className="mb-1 block text-sm font-medium">Label <span className="text-error-500">*</span></label>
          <input id="label" name="label" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Support A soundcheck" />
        </div>
        {acts.length > 0 && (
          <div>
            <label htmlFor="act_id" className="mb-1 block text-sm font-medium">Act</label>
            <select id="act_id" name="act_id" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
              <option value="">All acts / general</option>
              {acts.map((a) => <option key={a.id} value={a.id}>{a.act_name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">Notes</label>
        <input id="notes" name="notes" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Optional notes..." />
      </div>

      <button type="submit" disabled={loading} className="self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Adding...' : 'Add Block'}</button>
    </form>
  )
}
