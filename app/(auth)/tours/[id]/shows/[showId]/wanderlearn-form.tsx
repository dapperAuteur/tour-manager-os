'use client'

import { useState, useTransition } from 'react'
import { Globe, Check, X } from 'lucide-react'

interface Props {
  showId: string
  initialUrl: string | null
}

export function WanderlearnForm({ showId, initialUrl }: Props) {
  const [savedUrl, setSavedUrl] = useState<string | null>(initialUrl)
  const [input, setInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save(nextInput: string) {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/shows/${showId}/wanderlearn`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input: nextInput }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Could not save.')
        return
      }
      setSavedUrl(data.wanderlearn_url ?? null)
      setInput('')
      setEditing(false)
    })
  }

  return (
    <div className="rounded-lg border border-border-default bg-surface-raised p-4">
      <div className="mb-2 flex items-center gap-2">
        <Globe className="size-4 text-primary-600 dark:text-primary-400" aria-hidden />
        <h3 className="text-sm font-semibold">Virtual tour (WanderLearn)</h3>
      </div>

      {savedUrl && !editing ? (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary">
            Attached. Fans see the virtual tour on this show&apos;s public
            page.
          </p>
          <a
            href={savedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-xs text-primary-700 hover:underline dark:text-primary-400"
          >
            {savedUrl}
          </a>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-border-default px-2.5 py-1 text-xs font-medium hover:bg-surface-alt"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => save('')}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-md border border-border-default px-2.5 py-1 text-xs font-medium text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
            >
              <X className="size-3" aria-hidden /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary">
            Paste the WanderLearn embed code or tour link. Fans watch a 360
            virtual tour on the show&apos;s public page.
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder='<iframe src="https://wanderlearn.witus.online/embed/tours/..."></iframe>'
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 font-mono text-xs"
          />
          {error && (
            <p className="text-xs text-error-500" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => save(input)}
              disabled={pending || !input.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Check className="size-3" aria-hidden /> {pending ? 'Saving…' : 'Save'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setInput('')
                  setError(null)
                }}
                className="rounded-md border border-border-default px-2.5 py-1 text-xs font-medium hover:bg-surface-alt"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
