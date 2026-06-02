'use client'

import { useState } from 'react'
import { ExternalLink, Lock, Mail } from 'lucide-react'

interface UnlockedPiece {
  id: string
  phase: 'pre' | 'post'
  title: string
  body: string | null
  media_url: string | null
  call_to_action_label: string | null
  call_to_action_url: string | null
}

export function ExclusiveUnlock({ showId }: { showId: string }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [pieces, setPieces] = useState<UnlockedPiece[] | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setHint(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/shows/${showId}/exclusive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Unlock failed')
        return
      }
      if (!json.unlocked) {
        setHint(json.hint || "We couldn't find that email on the list.")
        return
      }
      setPieces(json.pieces || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unlock failed')
    } finally {
      setBusy(false)
    }
  }

  if (pieces && pieces.length === 0) {
    return (
      <div className="rounded-md border border-border-default bg-surface p-4 text-sm text-text-secondary">
        You&apos;re on the list — there&apos;s no exclusive content open for
        this show right now. Check back closer to doors (or right after).
      </div>
    )
  }

  if (pieces && pieces.length > 0) {
    return (
      <ul className="space-y-3">
        {pieces.map((p) => (
          <li
            key={p.id}
            className="rounded-md border border-primary-500/30 bg-primary-500/5 p-4"
          >
            <p className="mb-1 flex flex-wrap items-center gap-2 font-semibold">
              {p.title}
              <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                {p.phase === 'pre' ? 'Pre-show' : 'Post-show'}
              </span>
            </p>
            {p.body && (
              <p className="whitespace-pre-wrap text-sm text-text-secondary">{p.body}</p>
            )}
            {p.media_url && (
              <a
                href={p.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-primary-700 hover:underline dark:text-primary-400"
              >
                Open media <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
            {p.call_to_action_url && p.call_to_action_label && (
              <a
                href={p.call_to_action_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
              >
                {p.call_to_action_label}
              </a>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm text-text-secondary">
        Subscribers see acoustic previews, after-party RSVPs, and post-show
        downloads. Enter the email you signed up with to unlock what&apos;s
        open right now.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="exclusive-email">
          Email
        </label>
        <div className="relative flex-1 min-w-[12rem]">
          <Mail className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
          <input
            id="exclusive-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 pl-7 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !email}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? 'Checking…' : 'Unlock'}
        </button>
      </div>
      {hint && (
        <p className="text-xs text-warning-700 dark:text-warning-400">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
      <p className="flex items-start gap-1 text-[10px] text-text-muted">
        <Lock className="mt-0.5 size-3 shrink-0" aria-hidden />
        We never store, share, or email this address. It&apos;s only checked
        against the band&apos;s subscriber list.
      </p>
    </form>
  )
}
