'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Radio, ShieldOff, Trash2, X } from 'lucide-react'
import { createClient as createBrowserSupabase } from '@/lib/supabase/client'

type ModStatus = 'pending' | 'approved' | 'rejected' | 'removed'

interface AiVerdict {
  nsfw_likely?: boolean
  violence_likely?: boolean
  off_topic_likely?: boolean
  confidence?: 'low' | 'medium' | 'high'
  reason?: string
}

interface Photo {
  id: string
  cloudinary_url: string
  width: number | null
  height: number | null
  caption: string | null
  status: string
  submitted_at: string
  moderated_at: string | null
  rejection_reason: string | null
  user_id: string | null
  ai_moderation_verdict?: AiVerdict | null
  ai_auto_rejected?: boolean | null
}

interface ModerationQueueProps {
  photos: Photo[]
  counts: Record<ModStatus, number>
  showId: string
}

function thumbUrl(url: string, width = 600): string {
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width},c_limit/`,
  )
}

const TAB_LABELS: Record<ModStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  removed: 'Removed',
}

export function ModerationQueue({
  photos,
  counts,
  showId,
}: ModerationQueueProps) {
  const router = useRouter()
  const [tab, setTab] = useState<ModStatus>('pending')
  const [pending, startTransition] = useTransition()
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const [newSinceMount, setNewSinceMount] = useState(0)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Subscribe to fan_photos for this show. New pending submissions, status
  // flips from other moderators, and removals all trigger a debounced
  // router.refresh() — the server component re-fetches counts + rows.
  useEffect(() => {
    const supabase = createBrowserSupabase()

    const channel = supabase
      .channel(`fan-photos-show-${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fan_photos',
          filter: `show_id=eq.${showId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNewSinceMount((n) => n + 1)
          }
          if (refreshTimer.current) clearTimeout(refreshTimer.current)
          refreshTimer.current = setTimeout(() => {
            startTransition(() => router.refresh())
          }, 600)
        },
      )
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED')
      })

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      void supabase.removeChannel(channel)
    }
  }, [router, showId])

  const visible = useMemo(
    () => photos.filter((p) => p.status === tab),
    [photos, tab],
  )

  async function moderate(
    photoId: string,
    action: 'approve' | 'reject' | 'remove',
  ) {
    setError(null)
    if (action === 'reject') {
      const reason = window.prompt(
        'Why are you rejecting this photo? The poster will see this reason.',
      )
      if (!reason || !reason.trim()) return
      setActingOn(photoId)
      const res = await fetch(`/api/admin/fan-photos/${photoId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: reason.trim() }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      setActingOn(null)
      if (!res.ok) {
        setError(json.error || `failed (${res.status})`)
        return
      }
    } else {
      if (action === 'remove' && !window.confirm('Remove this approved photo?')) return
      setActingOn(photoId)
      const res = await fetch(`/api/admin/fan-photos/${photoId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      setActingOn(null)
      if (!res.ok) {
        setError(json.error || `failed (${res.status})`)
        return
      }
    }
    startTransition(() => router.refresh())
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Radio
            className={`size-3 ${live ? 'animate-pulse text-success-600 dark:text-success-400' : 'text-text-muted'}`}
            aria-hidden
          />
          <span className="text-text-muted">
            {live ? 'Realtime moderation queue connected' : 'Realtime offline — refresh to see new photos'}
          </span>
        </div>
        {newSinceMount > 0 && (
          <span className="rounded-full bg-warning-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning-700 dark:text-warning-300">
            {newSinceMount} new since you opened this
          </span>
        )}
      </div>

      <div
        role="tablist"
        className="mb-6 flex flex-wrap gap-1 border-b border-border-default"
      >
        {(Object.keys(TAB_LABELS) as ModStatus[]).map((s) => {
          const active = s === tab
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(s)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              {TAB_LABELS[s]}{' '}
              <span className="ml-1 rounded-full bg-surface-alt px-1.5 py-0.5 text-xs">
                {counts[s]}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
        >
          {error}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-border-default bg-surface-raised p-8 text-center text-sm text-text-muted">
          Nothing here.
        </div>
      ) : (
        <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => {
            const acting = actingOn === p.id || pending
            return (
              <li
                key={p.id}
                className="overflow-hidden rounded-2xl border border-border-default bg-surface-raised"
              >
                <div className="relative aspect-square bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl(p.cloudinary_url, 600)}
                    alt={p.caption || ''}
                    width={p.width ?? undefined}
                    height={p.height ?? undefined}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  {p.caption ? (
                    <p className="line-clamp-3 text-sm">{p.caption}</p>
                  ) : (
                    <p className="text-sm italic text-text-muted">No caption</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                    <time dateTime={p.submitted_at}>
                      Submitted{' '}
                      {new Date(p.submitted_at).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </time>
                    {p.user_id && (
                      <span className="font-mono">
                        Poster: {p.user_id.slice(0, 8)}…
                      </span>
                    )}
                  </div>
                  {p.status === 'rejected' && p.rejection_reason && (
                    <p className="mt-2 text-xs italic text-text-muted">
                      Reason: {p.rejection_reason}
                    </p>
                  )}
                  {p.ai_moderation_verdict && (
                    <div className="mt-2 rounded border border-warning-500/30 bg-warning-500/5 p-2 text-[10px] text-text-secondary">
                      <p className="font-semibold uppercase tracking-wide text-warning-700 dark:text-warning-300">
                        AI verdict ({p.ai_moderation_verdict.confidence || 'unknown'})
                        {p.ai_auto_rejected ? ' · auto-rejected' : ''}
                      </p>
                      <p className="mt-0.5 flex flex-wrap gap-1">
                        {p.ai_moderation_verdict.nsfw_likely && (
                          <span className="rounded-full bg-error-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-error-700 dark:text-error-300">NSFW</span>
                        )}
                        {p.ai_moderation_verdict.violence_likely && (
                          <span className="rounded-full bg-error-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-error-700 dark:text-error-300">Violence</span>
                        )}
                        {p.ai_moderation_verdict.off_topic_likely && (
                          <span className="rounded-full bg-warning-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-warning-700 dark:text-warning-300">Off-topic</span>
                        )}
                      </p>
                      {p.ai_moderation_verdict.reason && (
                        <p className="mt-1 italic">{p.ai_moderation_verdict.reason}</p>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => moderate(p.id, 'approve')}
                          disabled={acting}
                          className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {acting && actingOn === p.id ? (
                            <Loader2 className="size-3 animate-spin" aria-hidden />
                          ) : (
                            <Check className="size-3" aria-hidden />
                          )}{' '}
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => moderate(p.id, 'reject')}
                          disabled={acting}
                          className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                        >
                          <X className="size-3" aria-hidden /> Reject
                        </button>
                      </>
                    )}
                    {p.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => moderate(p.id, 'remove')}
                        disabled={acting}
                        className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="size-3" aria-hidden /> Remove
                      </button>
                    )}
                    {p.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                        <ShieldOff className="size-3" aria-hidden /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
