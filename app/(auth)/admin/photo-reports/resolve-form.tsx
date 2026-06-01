'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { resolvePhotoReport } from '@/lib/photos/report-actions'

export function ResolveForm({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState<'dismiss' | 'take_down' | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function go(action: 'dismiss' | 'take_down') {
    if (action === 'take_down' && !notes.trim()) {
      setError('Add a short note for the takedown record.')
      return
    }
    setBusy(action)
    setError(null)
    const result = await resolvePhotoReport(reportId, action, notes)
    setBusy(null)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">
          Resolution notes (required to take down)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Why kept or removed — appears in the audit log"
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => go('dismiss')}
          disabled={!!busy}
          className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-1.5 text-xs font-medium hover:bg-surface-alt disabled:opacity-50"
        >
          <X className="size-3" aria-hidden />
          {busy === 'dismiss' ? 'Dismissing…' : 'Dismiss (keep up)'}
        </button>
        <button
          type="button"
          onClick={() => go('take_down')}
          disabled={!!busy}
          className="inline-flex items-center gap-1 rounded-md bg-error-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-error-700 disabled:opacity-50"
        >
          <Check className="size-3" aria-hidden />
          {busy === 'take_down' ? 'Removing…' : 'Take down photo'}
        </button>
        {error && (
          <p role="alert" className="text-xs text-error-600 dark:text-error-500">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
