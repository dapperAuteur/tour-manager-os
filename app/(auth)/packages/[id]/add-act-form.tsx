'use client'

import { useState } from 'react'
import { addActToPackage } from '@/lib/packages/actions'

export function AddActForm({ packageId }: { packageId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSuccess(false)
    setLoading(true)
    const result = await addActToPackage(packageId, formData)
    if (result?.error) setError(result.error)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}
      {success && <div role="status" className="rounded-lg bg-success-500/10 p-3 text-sm text-success-600 dark:text-success-500">Act added!</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="act_name" className="mb-1 block text-sm font-medium">Act Name <span className="text-error-500">*</span></label>
          <input id="act_name" name="act_name" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="act_type" className="mb-1 block text-sm font-medium">Type</label>
          <select id="act_type" name="act_type" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="headliner">Headliner</option>
            <option value="support" selected>Support</option>
            <option value="opener">Opener</option>
            <option value="special_guest">Special Guest</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="set_length_minutes" className="mb-1 block text-sm font-medium">Set Length (min)</label>
          <input id="set_length_minutes" name="set_length_minutes" type="number" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="45" />
        </div>
        <div>
          <label htmlFor="contact_name" className="mb-1 block text-sm font-medium">Contact</label>
          <input id="contact_name" name="contact_name" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="contact_phone" className="mb-1 block text-sm font-medium">Phone</label>
          <input id="contact_phone" name="contact_phone" type="tel" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Adding...' : 'Add Act'}</button>
    </form>
  )
}
