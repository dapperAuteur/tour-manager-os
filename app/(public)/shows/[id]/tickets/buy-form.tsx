'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface TicketTypeOption {
  id: string
  name: string
  category: string
  price: number
  description: string | null
  remaining: number | null
}

interface BuyFormProps {
  showId: string
  ticketTypes: TicketTypeOption[]
}

const MAX_QTY = 10

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents)
}

export function BuyForm({ showId, ticketTypes }: BuyFormProps) {
  const searchParams = useSearchParams()
  const cancelled = searchParams.get('cancelled') === 'true'

  const [selectedId, setSelectedId] = useState(ticketTypes[0]?.id ?? '')
  const [qty, setQty] = useState(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = ticketTypes.find((t) => t.id === selectedId)
  const total = selected ? selected.price * qty : 0

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || submitting) return

    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/tickets/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          show_id: showId,
          ticket_type_id: selected.id,
          qty,
          purchaser_email: email || undefined,
          purchaser_name: name || undefined,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as {
        url?: string
        error?: string
      }
      if (!res.ok || !json.url) {
        setError(json.error || 'Checkout failed')
        setSubmitting(false)
        return
      }
      window.location.href = json.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {cancelled && (
        <div
          role="status"
          className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900 dark:border-yellow-900/50 dark:bg-yellow-950/30 dark:text-yellow-200"
        >
          Checkout was cancelled. No charge was made.
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Ticket type
        </legend>
        <div className="space-y-2">
          {ticketTypes.map((t) => {
            const selected = t.id === selectedId
            const soldOut = t.remaining !== null && t.remaining <= 0
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700'
                } ${soldOut ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <input
                  type="radio"
                  name="ticket_type"
                  value={t.id}
                  checked={selected}
                  onChange={() => setSelectedId(t.id)}
                  disabled={soldOut}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{t.name}</div>
                    <div className="font-semibold">{formatPrice(t.price)}</div>
                  </div>
                  {t.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {t.description}
                    </p>
                  )}
                  {t.remaining !== null && t.remaining < 20 && (
                    <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                      {t.remaining} left
                    </p>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Quantity
          </span>
          <select
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {Array.from({ length: MAX_QTY }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Total
          </span>
          <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-base font-semibold dark:border-gray-700 dark:bg-gray-900">
            {formatPrice(total)}
          </div>
        </label>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Email <span className="text-gray-500">(for ticket delivery)</span>
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Name <span className="text-gray-500">(optional)</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            placeholder="Jane Doe"
          />
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!selected || submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Redirecting to checkout…
          </>
        ) : (
          `Continue to checkout — ${formatPrice(total)}`
        )}
      </button>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        Secure checkout via Stripe. Tickets emailed after purchase.
      </p>
    </form>
  )
}
