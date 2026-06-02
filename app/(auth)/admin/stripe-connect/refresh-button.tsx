'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { refreshConnectedAccountStatus } from '@/lib/stripe-connect/actions'

export function RefreshButton({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setBusy(true)
    setError(null)
    const result = await refreshConnectedAccountStatus(orgId)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-sm hover:bg-surface-alt disabled:opacity-50"
      >
        <RefreshCw
          className={`size-3.5 ${busy ? 'animate-spin' : ''}`}
          aria-hidden
        />{' '}
        Refresh status
      </button>
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
    </div>
  )
}
