'use client'

import { useState } from 'react'
import { createArrangement } from '@/lib/travel/actions'

export function NewTravelForm({ tourId }: { tourId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createArrangement(tourId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="type" className="mb-1 block text-sm font-medium">Type <span className="text-error-500">*</span></label>
        <select id="type" name="type" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
          <option value="">Select type...</option>
          <option value="flight">Flight</option>
          <option value="hotel">Hotel</option>
          <option value="rental_car">Rental Car</option>
          <option value="bus">Bus</option>
          <option value="train">Train</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="vendor" className="mb-1 block text-sm font-medium">Vendor</label>
        <input id="vendor" name="vendor" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Delta, Hilton, Enterprise..." />
      </div>

      <div>
        <label htmlFor="confirmation_number" className="mb-1 block text-sm font-medium">Confirmation Number</label>
        <input id="confirmation_number" name="confirmation_number" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="check_in" className="mb-1 block text-sm font-medium">Check-in / Start Date</label>
          <input id="check_in" name="check_in" type="date" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="check_out" className="mb-1 block text-sm font-medium">Check-out / End Date</label>
          <input id="check_out" name="check_out" type="date" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
      </div>

      <div>
        <label htmlFor="cost" className="mb-1 block text-sm font-medium">Cost ($)</label>
        <input id="cost" name="cost" type="number" step="0.01" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium">Address</label>
        <input id="address" name="address" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone</label>
        <input id="phone" name="phone" type="tel" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">Notes</label>
        <textarea id="notes" name="notes" rows={3} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>

      <div>
        <label htmlFor="show_id" className="mb-1 block text-sm font-medium">Associated Show ID (optional)</label>
        <input id="show_id" name="show_id" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium">Status</label>
        <select id="status" name="status" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Saving...' : 'Add Arrangement'}</button>
    </form>
  )
}
