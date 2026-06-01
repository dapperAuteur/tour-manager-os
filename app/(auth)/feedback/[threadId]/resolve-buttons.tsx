'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertTriangle } from 'lucide-react'
import { markFeedbackResolved } from '@/lib/feedback/actions'

export function ResolveButtons({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState<'confirmed_fixed' | 'still_happening' | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  async function click(action: 'confirmed_fixed' | 'still_happening') {
    setBusy(action)
    setError(null)
    const result = await markFeedbackResolved(threadId, action)
    setBusy(null)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-5">
      <h2 className="mb-1 font-semibold">Did this fix your issue?</h2>
      <p className="mb-4 text-xs text-text-muted">
        Confirming closes the thread. If it&apos;s still happening, we&apos;ll
        re-open it for the team.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => click('confirmed_fixed')}
          disabled={!!busy}
          className="inline-flex items-center gap-1 rounded-md bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-700 disabled:opacity-50"
        >
          <Check className="size-4" aria-hidden />
          {busy === 'confirmed_fixed' ? 'Marking…' : 'Yes, it’s fixed'}
        </button>
        <button
          type="button"
          onClick={() => click('still_happening')}
          disabled={!!busy}
          className="inline-flex items-center gap-1 rounded-md border border-warning-500/40 bg-warning-500/5 px-4 py-2 text-sm font-medium text-warning-700 hover:bg-warning-500/10 disabled:opacity-50 dark:text-warning-400"
        >
          <AlertTriangle className="size-4" aria-hidden />
          {busy === 'still_happening' ? 'Marking…' : 'Still happening'}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
    </div>
  )
}
