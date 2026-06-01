'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Truck } from 'lucide-react'
import { markOrderFulfilled, reopenOrder } from '@/lib/merch/order-actions'

export function FulfillForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [tracking, setTracking] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fulfill() {
    setBusy(true)
    setError(null)
    const result = await markOrderFulfilled(orderId, tracking)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setTracking('')
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex-1 min-w-48">
        <span className="mb-1 block text-xs font-medium">
          Tracking number (optional)
        </span>
        <input
          type="text"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          maxLength={120}
          placeholder="USPS 9400 1112 …"
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
      <button
        type="button"
        onClick={fulfill}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-md bg-success-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-success-700 disabled:opacity-50"
      >
        <Truck className="size-3" aria-hidden />
        {busy ? 'Marking…' : 'Mark fulfilled'}
      </button>
      {error && (
        <span role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </span>
      )}
    </div>
  )
}

export function ReopenButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  async function go() {
    setBusy(true)
    const result = await reopenOrder(orderId)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    startTransition(() => router.refresh())
  }
  return (
    <button
      type="button"
      onClick={go}
      disabled={busy}
      className="rounded-md border border-border-default px-2 py-0.5 text-[10px] font-medium hover:bg-surface-alt disabled:opacity-50"
    >
      Reopen
    </button>
  )
}
