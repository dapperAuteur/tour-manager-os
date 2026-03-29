'use client'

import { useState } from 'react'
import { createPromoCode } from '@/lib/subscriptions/actions'

export function NewPromoForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createPromoCode(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="code" className="mb-1 block text-sm font-medium">Code <span className="text-error-500">*</span></label>
        <input id="code" name="code" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm font-mono uppercase focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="SUMMER2026" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <input id="description" name="description" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Summer launch promo" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="discount_type" className="mb-1 block text-sm font-medium">Discount Type</label>
          <select id="discount_type" name="discount_type" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label htmlFor="discount_value" className="mb-1 block text-sm font-medium">Value <span className="text-error-500">*</span></label>
          <input id="discount_value" name="discount_value" type="number" step="0.01" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="20" />
        </div>
        <div>
          <label htmlFor="applies_to" className="mb-1 block text-sm font-medium">Applies To</label>
          <select id="applies_to" name="applies_to" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="all">All</option>
            <option value="lifetime">Lifetime Only</option>
            <option value="annual">Annual Only</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="max_uses" className="mb-1 block text-sm font-medium">Max Uses</label>
          <input id="max_uses" name="max_uses" type="number" min="1" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Unlimited" />
        </div>
        <div>
          <label htmlFor="expires_at" className="mb-1 block text-sm font-medium">Expires</label>
          <input id="expires_at" name="expires_at" type="datetime-local" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_lifetime_grant" className="rounded accent-primary-600" />
        This code grants a free lifetime membership
      </label>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Promo Code'}</button>
    </form>
  )
}
