'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react'
import {
  createExclusivePiece,
  deleteExclusivePiece,
  setExclusiveActive,
} from '@/lib/exclusive-content/actions'
import type { ExclusivePiece } from '@/lib/exclusive-content/queries'

const PHASE_LABEL: Record<string, string> = {
  pre: 'Pre-show',
  post: 'Post-show',
}

export function ExclusiveContentEditor({
  showId,
  orgId,
  initial,
}: {
  showId: string
  orgId: string
  initial: ExclusivePiece[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onAdd(formData: FormData) {
    setBusy(true)
    setError(null)
    const result = await createExclusivePiece(formData)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setAdding(false)
    startTransition(() => router.refresh())
  }
  async function remove(id: string) {
    if (!window.confirm('Delete this exclusive piece?')) return
    setBusy(true)
    const result = await deleteExclusivePiece(id)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }
  async function toggle(id: string, next: boolean) {
    setBusy(true)
    const result = await setExclusiveActive(id, next)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Content ({initial.length})
        </h2>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 dark:text-primary-300"
        >
          {adding ? <X className="size-3" aria-hidden /> : <Plus className="size-3" aria-hidden />}
          {adding ? 'Cancel' : 'Add piece'}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}

      {adding && (
        <form
          action={onAdd}
          className="space-y-3 rounded-xl border border-primary-500/30 bg-primary-500/5 p-4"
        >
          <input type="hidden" name="show_id" value={showId} />
          <input type="hidden" name="org_id" value={orgId} />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Phase</span>
              <select
                name="phase"
                defaultValue="pre"
                className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
              >
                <option value="pre">Pre-show</option>
                <option value="post">Post-show</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium">
                Unlock offset (hours from midnight show day)
              </span>
              <input
                type="number"
                name="unlock_offset_hours"
                defaultValue="-24"
                className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
              />
              <span className="mt-1 block text-[10px] text-text-muted">
                -48 = 2 days before · 0 = midnight show day · 6 = post-show window opens
              </span>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Title</span>
            <input
              type="text"
              name="title"
              required
              maxLength={120}
              placeholder="Acoustic preview of the new single"
              className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Body (markdown OK)</span>
            <textarea
              name="body"
              rows={4}
              maxLength={2000}
              placeholder="Three minutes of unreleased music. Don&apos;t share — this is just for you."
              className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Media URL (optional)</span>
            <input
              type="url"
              name="media_url"
              placeholder="https://soundcloud.com/.../acoustic-preview"
              className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium">CTA label (optional)</span>
              <input
                type="text"
                name="call_to_action_label"
                maxLength={40}
                placeholder="RSVP for the after-party"
                className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">CTA URL (optional)</span>
              <input
                type="url"
                name="call_to_action_url"
                placeholder="https://..."
                className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save piece'}
          </button>
        </form>
      )}

      {initial.length === 0 ? (
        <p className="rounded-md border border-border-default bg-surface-raised p-5 text-sm text-text-secondary">
          No exclusive content yet for this show.
        </p>
      ) : (
        <ul className="space-y-3">
          {initial.map((p) => (
            <li
              key={p.id}
              className={`rounded-xl border border-border-default p-4 ${
                p.active ? 'bg-surface-raised' : 'bg-surface opacity-60'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {p.title}
                    <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                      {PHASE_LABEL[p.phase]}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      Unlocks at midnight show day {p.unlock_offset_hours >= 0 ? '+' : ''}
                      {p.unlock_offset_hours}h
                    </span>
                  </p>
                  {p.body && (
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{p.body}</p>
                  )}
                  {(p.media_url || p.call_to_action_url) && (
                    <p className="mt-1 truncate text-[10px] text-text-muted">
                      {p.media_url && `Media: ${p.media_url}`}
                      {p.media_url && p.call_to_action_url && ' · '}
                      {p.call_to_action_url &&
                        `CTA: ${p.call_to_action_label || 'Open'} → ${p.call_to_action_url}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggle(p.id, !p.active)}
                    disabled={busy}
                    aria-label={p.active ? 'Deactivate' : 'Activate'}
                    className="rounded p-1 text-text-muted hover:bg-surface-alt"
                  >
                    {p.active ? (
                      <ToggleRight className="size-4 text-success-600 dark:text-success-400" aria-hidden />
                    ) : (
                      <ToggleLeft className="size-4" aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    disabled={busy}
                    aria-label="Delete"
                    className="rounded p-1 text-error-600 hover:bg-error-500/10 dark:text-error-400"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
