'use client'

import { useState, useTransition } from 'react'
import { Radio, RadioTower } from 'lucide-react'

interface Props {
  showId: string
  initialLive: boolean
  configured: boolean
}

export function StreamToggle({ showId, initialLive, configured }: Props) {
  const [live, setLive] = useState(initialLive)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggle() {
    setError(null)
    const nextAction = live ? 'stop' : 'start'
    startTransition(async () => {
      const res = await fetch(`/api/shows/${showId}/stream`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: nextAction }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Failed to update stream status.')
        return
      }
      setLive(!live)
    })
  }

  if (!configured) {
    return (
      <div className="rounded-lg border border-warning-500/30 bg-warning-500/10 px-3 py-2 text-xs text-warning-600 dark:text-warning-500">
        Live streaming not set up. Ask the platform team to add the
        streaming env vars.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={live}
        className={
          live
            ? 'inline-flex items-center gap-2 rounded-lg bg-error-500/90 px-3 py-2 text-sm font-medium text-white hover:bg-error-500 disabled:opacity-60'
            : 'inline-flex items-center gap-2 rounded-lg border border-border-default bg-surface-raised px-3 py-2 text-sm font-medium hover:bg-surface-alt disabled:opacity-60'
        }
      >
        {live ? (
          <>
            <RadioTower className="size-4" aria-hidden /> Streaming live &middot; Stop
          </>
        ) : (
          <>
            <Radio className="size-4" aria-hidden /> Go live
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-error-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
