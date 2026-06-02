'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { createConnectOnboardingLink } from '@/lib/stripe-connect/actions'

export function OnboardButton({
  orgId,
  label,
}: {
  orgId: string
  label: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setBusy(true)
    setError(null)
    const returnUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/admin/stripe-connect?return=1`
        : '/admin/stripe-connect'
    const result = await createConnectOnboardingLink(orgId, returnUrl)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    window.location.href = result.url
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {busy ? 'Opening Stripe…' : label}{' '}
        <ExternalLink className="size-3.5" aria-hidden />
      </button>
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
    </div>
  )
}
