'use client'

import { useState } from 'react'
import { createTour } from '@/lib/tours/actions'

export function CreateTourForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createTour(formData)
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
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Tour Name <span aria-hidden="true" className="text-error-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          aria-required="true"
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="Summer 2026 Tour"
        />
      </div>

      <div>
        <label htmlFor="artist_name" className="mb-1 block text-sm font-medium">
          Artist / Band Name <span aria-hidden="true" className="text-error-500">*</span>
        </label>
        <input
          id="artist_name"
          name="artist_name"
          type="text"
          required
          aria-required="true"
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="The Roadwell Family"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="Optional tour description..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start_date" className="mb-1 block text-sm font-medium">
            Start Date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          />
        </div>
        <div>
          <label htmlFor="end_date" className="mb-1 block text-sm font-medium">
            End Date
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
      >
        {loading ? 'Creating...' : 'Create Tour'}
      </button>
    </form>
  )
}
