'use client'

import { useState } from 'react'
import { createExpense } from '@/lib/finances/actions'

interface Show {
  id: string
  date: string
  city: string
  state: string | null
  venue_name: string | null
}

export function AddExpenseForm({ tourId, shows }: { tourId: string; shows: Show[] }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createExpense(tourId, formData)
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

      <div className="grid gap-4 sm:grid-cols-2">
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
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          />
        </div>

        <div>
          <label htmlFor="amount" className="mb-1 block text-sm font-medium">
            Amount ($) <span aria-hidden="true" className="text-error-500">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            aria-required="true"
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium">
          Category <span aria-hidden="true" className="text-error-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          aria-required="true"
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        >
          <option value="">Select category...</option>
          <option value="travel">Travel</option>
          <option value="hotel">Hotel</option>
          <option value="per_diem">Per Diem</option>
          <option value="meals">Meals</option>
          <option value="equipment">Equipment</option>
          <option value="crew">Crew</option>
          <option value="merch">Merch</option>
          <option value="marketing">Marketing</option>
          <option value="insurance">Insurance</option>
          <option value="other">Other</option>
        </select>
      </div>

      {shows.length > 0 && (
        <div>
          <label htmlFor="show_id" className="mb-1 block text-sm font-medium">Show (optional)</label>
          <select
            id="show_id"
            name="show_id"
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          >
            <option value="">General tour expense</option>
            {shows.map((show) => (
              <option key={show.id} value={show.id}>
                {new Date(show.date).toLocaleDateString()} — {show.venue_name || show.city}{show.state ? `, ${show.state}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="What was this expense for?"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_tax_deductible" className="rounded accent-primary-600" />
        Tax deductible
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
      >
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  )
}
