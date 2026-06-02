'use client'

import { useState } from 'react'
import { createProduct } from '@/lib/merch/actions'

interface TourOption { id: string; name: string }

export function AddProductForm({
  orgId,
  tours = [],
}: {
  orgId: string
  tours?: TourOption[]
}) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isExclusive, setIsExclusive] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createProduct(orgId, formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Product Name <span className="text-error-500">*</span>
        </label>
        <input id="name" name="name" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Tour T-Shirt 2026" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={2} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Black cotton tee with tour dates on back" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sku" className="mb-1 block text-sm font-medium">SKU</label>
          <input id="sku" name="sku" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="TSHIRT-BLK-2026" />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">Category</label>
          <select id="category" name="category" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="">Select...</option>
            <option value="apparel">Apparel</option>
            <option value="vinyl">Vinyl</option>
            <option value="cd">CD</option>
            <option value="poster">Poster</option>
            <option value="accessory">Accessory</option>
            <option value="bundle">Bundle</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            Price ($) <span className="text-error-500">*</span>
          </label>
          <input id="price" name="price" type="number" step="0.01" min="0" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="25.00" />
        </div>
        <div>
          <label htmlFor="cost_basis" className="mb-1 block text-sm font-medium">Cost per Unit ($)</label>
          <input id="cost_basis" name="cost_basis" type="number" step="0.01" min="0" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="8.50" />
        </div>
      </div>

      <fieldset className="rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium">Shipping dimensions</legend>
        <p className="mb-3 text-xs text-text-muted">
          Used by Shippo to quote live shipping rates. Leave blank to use category defaults
          (apparel 8oz, vinyl 16oz, etc.) — but accurate values give accurate rates.
        </p>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="weight_oz" className="mb-1 block text-xs font-medium">Weight (oz)</label>
            <input id="weight_oz" name="weight_oz" type="number" step="0.1" min="0" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm" placeholder="8" />
          </div>
          <div>
            <label htmlFor="length_in" className="mb-1 block text-xs font-medium">Length (in)</label>
            <input id="length_in" name="length_in" type="number" step="0.1" min="0" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm" placeholder="10" />
          </div>
          <div>
            <label htmlFor="width_in" className="mb-1 block text-xs font-medium">Width (in)</label>
            <input id="width_in" name="width_in" type="number" step="0.1" min="0" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm" placeholder="8" />
          </div>
          <div>
            <label htmlFor="height_in" className="mb-1 block text-xs font-medium">Height (in)</label>
            <input id="height_in" name="height_in" type="number" step="0.1" min="0" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm" placeholder="1" />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium">Tour-exclusive drop</legend>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="is_exclusive"
            checked={isExclusive}
            onChange={(e) => setIsExclusive(e.target.checked)}
            className="mt-0.5 rounded accent-primary-600"
          />
          <span>
            Limit visibility to a specific tour or date window. Off = the
            product is always available in your public store.
          </span>
        </label>
        {isExclusive && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label htmlFor="drop_tour_id" className="mb-1 block text-xs font-medium">
                Tied to tour
              </label>
              <select
                id="drop_tour_id"
                name="drop_tour_id"
                className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm"
                disabled={tours.length === 0}
              >
                <option value="">— Not tied to a tour —</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {tours.length === 0 && (
                <p className="mt-1 text-xs text-text-muted">
                  No tours yet — drop will show whenever the window is active.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="drop_starts_at" className="mb-1 block text-xs font-medium">
                Visible from
              </label>
              <input
                id="drop_starts_at"
                name="drop_starts_at"
                type="datetime-local"
                className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="drop_ends_at" className="mb-1 block text-xs font-medium">
                Visible until
              </label>
              <input
                id="drop_ends_at"
                name="drop_ends_at"
                type="datetime-local"
                className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm"
              />
            </div>
            <p className="text-xs text-text-muted sm:col-span-3">
              Leave both dates blank for an &ldquo;exclusive while the tour
              runs&rdquo; product. The storefront badges drops as{' '}
              <strong>Tour exclusive</strong>.
            </p>
          </div>
        )}
      </fieldset>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface">
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </form>
  )
}
