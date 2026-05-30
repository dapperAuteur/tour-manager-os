'use client'

import { useState } from 'react'
import Link from 'next/link'

interface InitialValues {
  name?: string
  category?: string
  price?: number | string
  quantity_available?: number | null
  description?: string | null
  active?: boolean
}

interface TicketTypeFormProps {
  tourId: string
  showId: string
  initial?: InitialValues
  submitLabel: string
  action: (formData: FormData) => Promise<{ error?: string } | void>
  backHref: string
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General Admission',
  vip: 'VIP',
  reserved: 'Reserved Seating',
  comp: 'Complimentary (free)',
}

export function TicketTypeForm({
  initial = {},
  submitLabel,
  action,
  backHref,
}: TicketTypeFormProps) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [category, setCategory] = useState(initial.category || 'general')
  const [price, setPrice] = useState(
    initial.price !== undefined && initial.price !== null
      ? String(initial.price)
      : category === 'comp'
        ? '0'
        : '',
  )
  const [unlimited, setUnlimited] = useState(
    initial.quantity_available === null || initial.quantity_available === undefined
      ? false
      : false,
  )
  const initialQuantity =
    initial.quantity_available === null || initial.quantity_available === undefined
      ? ''
      : String(initial.quantity_available)
  const [quantity, setQuantity] = useState(initialQuantity)
  const [active, setActive] = useState(initial.active ?? true)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSubmitting(true)
    const result = await action(formData)
    if (result && 'error' in result && result.error) {
      setError(result.error)
      setSubmitting(false)
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
          Name <span aria-hidden="true" className="text-error-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={120}
          defaultValue={initial.name || ''}
          placeholder="e.g. General Admission, VIP Meet & Greet, Front Row"
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        />
        <p className="mt-1 text-xs text-text-muted">
          This is what fans see on the buy page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            Category <span aria-hidden="true" className="text-error-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            value={category}
            onChange={(e) => {
              const next = e.target.value
              setCategory(next)
              if (next === 'comp') setPrice('0')
            }}
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          >
            {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            Price (USD) <span aria-hidden="true" className="text-error-500">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={category === 'comp'}
            placeholder="25.00"
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt disabled:opacity-60"
          />
          <p className="mt-1 text-xs text-text-muted">
            Comp tickets are always $0. Other tiers need to be $0.50 or more (Stripe minimum).
          </p>
        </div>
      </div>

      <fieldset className="rounded-lg border border-border-default p-3">
        <legend className="px-1 text-sm font-medium">Inventory</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="unlimited"
            checked={unlimited}
            onChange={(e) => setUnlimited(e.target.checked)}
            className="rounded accent-primary-600"
          />
          Unlimited (no cap)
        </label>
        {!unlimited && (
          <div className="mt-3">
            <label htmlFor="quantity_available" className="mb-1 block text-sm font-medium">
              How many to sell?
            </label>
            <input
              id="quantity_available"
              name="quantity_available"
              type="number"
              min="1"
              step="1"
              required={!unlimited}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="100"
              className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt sm:max-w-xs"
            />
            <p className="mt-1 text-xs text-text-muted">
              When this many are sold, the option goes &ldquo;sold out&rdquo; automatically.
            </p>
          </div>
        )}
      </fieldset>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={initial.description ?? ''}
          placeholder="What does this tier include? (e.g. early entry, signed poster, etc.)"
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded accent-primary-600"
        />
        Visible on the public buy page
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <Link
          href={backHref}
          className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
