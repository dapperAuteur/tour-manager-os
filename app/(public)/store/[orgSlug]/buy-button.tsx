'use client'

import { useState } from 'react'
import { Loader2, ShoppingBag } from 'lucide-react'

export function BuyButton({
  orgSlug,
  productId,
  productName,
}: {
  orgSlug: string
  productId: string
  productName: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/merch/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          org_slug: orgSlug,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data?.error || 'Could not start checkout.')
        setBusy(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error — please try again.')
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label={`Buy ${productName}`}
        className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <ShoppingBag className="size-3" aria-hidden />
        )}
        Buy
      </button>
      {error && (
        <p role="alert" className="ml-2 text-[10px] text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
    </>
  )
}
