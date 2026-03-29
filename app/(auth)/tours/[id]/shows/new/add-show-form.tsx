'use client'

import { useState } from 'react'
import { createShow } from '@/lib/tours/actions'

interface AddShowFormProps {
  tourId: string
}

export function AddShowForm({ tourId }: AddShowFormProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createShow(tourId, formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium">
          Date <span aria-hidden="true" className="text-error-500">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          aria-required="true"
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium">
            City <span aria-hidden="true" className="text-error-500">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            aria-required="true"
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
            placeholder="Kannapolis"
          />
        </div>
        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium">
            State
          </label>
          <input
            id="state"
            name="state"
            type="text"
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
            placeholder="NC"
          />
        </div>
      </div>

      <div>
        <label htmlFor="venue_name" className="mb-1 block text-sm font-medium">
          Venue Name
        </label>
        <input
          id="venue_name"
          name="venue_name"
          type="text"
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="Village Park"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="country" className="mb-1 block text-sm font-medium">
            Country
          </label>
          <input
            id="country"
            name="country"
            type="text"
            defaultValue="US"
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          />
        </div>
        <div>
          <label htmlFor="timezone" className="mb-1 block text-sm font-medium">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue="America/New_York"
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          >
            <option value="America/New_York">Eastern</option>
            <option value="America/Chicago">Central</option>
            <option value="America/Denver">Mountain</option>
            <option value="America/Los_Angeles">Pacific</option>
            <option value="America/Anchorage">Alaska</option>
            <option value="Pacific/Honolulu">Hawaii</option>
            <option value="Europe/London">GMT / London</option>
            <option value="Europe/Paris">CET / Paris</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
      >
        {loading ? 'Adding...' : 'Add Show'}
      </button>
    </form>
  )
}
