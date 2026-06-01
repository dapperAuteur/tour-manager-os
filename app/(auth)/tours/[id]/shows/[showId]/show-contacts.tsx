'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, Plus, UserRound, X } from 'lucide-react'
import {
  addShowContact,
  removeShowContact,
} from '@/lib/shows/contact-actions'

interface OverrideRow {
  contact_id: string
  role_override: string | null
  note: string | null
  name: string
  role: string
  phone: string | null
  email: string | null
  venue_name: string
}

interface Candidate {
  id: string
  name: string
  role: string
  venue_name: string
}

const ROLE_OPTIONS = [
  'booker', 'production', 'hospitality', 'sound', 'lighting',
  'merch', 'security', 'house', 'other',
]

export function ShowContacts({
  tourId,
  showId,
  overrides,
  candidates,
}: {
  tourId: string
  showId: string
  overrides: OverrideRow[]
  candidates: Candidate[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const [pickContactId, setPickContactId] = useState('')
  const [pickRole, setPickRole] = useState('')
  const [pickNote, setPickNote] = useState('')
  const [query, setQuery] = useState('')

  const overrideIds = useMemo(
    () => new Set(overrides.map((o) => o.contact_id)),
    [overrides],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return candidates
      .filter((c) => !overrideIds.has(c.id))
      .filter(
        (c) =>
          q.length === 0 ||
          c.name.toLowerCase().includes(q) ||
          c.venue_name.toLowerCase().includes(q),
      )
      .slice(0, 20)
  }, [candidates, overrideIds, query])

  function refresh() {
    startTransition(() => router.refresh())
  }

  async function addOverride() {
    if (!pickContactId) return
    setBusy(pickContactId)
    const result = await addShowContact(
      tourId,
      showId,
      pickContactId,
      pickRole || null,
      pickNote || null,
    )
    setBusy(null)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    setPickContactId('')
    setPickRole('')
    setPickNote('')
    setQuery('')
    refresh()
  }
  async function remove(contactId: string) {
    setBusy(contactId)
    const result = await removeShowContact(tourId, showId, contactId)
    setBusy(null)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    refresh()
  }

  return (
    <section
      aria-label="Show contacts"
      className="rounded-xl border border-border-default bg-surface-raised p-5"
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
          <UserRound className="size-4" aria-hidden /> Show Contacts
        </h3>
        {!pickerOpen && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 dark:text-primary-300"
          >
            <Plus className="size-3" aria-hidden /> Pin contact
          </button>
        )}
      </header>

      {overrides.length === 0 && !pickerOpen && (
        <p className="text-xs text-text-muted">
          No contacts pinned for this show. The advance-sheet contacts
          and the venue profile&apos;s contacts apply by default. Pin
          someone here to override for this show only (e.g. a sub
          production lead).
        </p>
      )}

      {overrides.length > 0 && (
        <ul className="mb-3 space-y-2">
          {overrides.map((o) => (
            <li
              key={o.contact_id}
              className="flex items-start justify-between gap-3 rounded-md border border-border-default bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {o.name}{' '}
                  <span className="text-xs font-normal text-text-muted">
                    &middot; {o.role}
                  </span>
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted">
                  <span>{o.venue_name}</span>
                  {o.phone && (
                    <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1 hover:text-text-secondary">
                      <Phone className="size-3" aria-hidden /> {o.phone}
                    </a>
                  )}
                  {o.email && (
                    <a href={`mailto:${o.email}`} className="inline-flex items-center gap-1 hover:text-text-secondary">
                      <Mail className="size-3" aria-hidden /> {o.email}
                    </a>
                  )}
                </div>
                {o.note && (
                  <p className="mt-1 text-xs italic text-text-secondary">
                    &ldquo;{o.note}&rdquo;
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(o.contact_id)}
                disabled={busy === o.contact_id}
                className="rounded-md border border-error-500/30 px-2 py-1 text-xs font-medium text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
                aria-label={`Unpin ${o.name}`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pickerOpen && (
        <div className="rounded-md border border-primary-500/30 bg-primary-500/5 p-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venue contacts…"
            aria-label="Search venue contacts"
            className="mb-2 w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
          {!pickContactId ? (
            <ul className="max-h-60 space-y-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="text-xs text-text-muted">
                  No more contacts to pin.
                </li>
              ) : (
                filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setPickContactId(c.id)}
                      className="flex w-full items-center justify-between rounded-md bg-surface p-2 text-left text-sm hover:border-primary-500/40"
                    >
                      <span>
                        {c.name}{' '}
                        <span className="text-xs text-text-muted">
                          &middot; {c.role} &middot; {c.venue_name}
                        </span>
                      </span>
                      <span className="text-xs text-primary-700 dark:text-primary-400">
                        Choose
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-text-muted">
                Pinning{' '}
                <span className="font-medium text-text-primary">
                  {
                    candidates.find((c) => c.id === pickContactId)?.name
                  }
                </span>
                {' '}for this show.
              </p>
              <label className="block">
                <span className="mb-1 block text-xs font-medium">
                  Role override (optional)
                </span>
                <select
                  value={pickRole}
                  onChange={(e) => setPickRole(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
                >
                  <option value="">— Use their default role —</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium">
                  Note (optional)
                </span>
                <input
                  type="text"
                  value={pickNote}
                  onChange={(e) => setPickNote(e.target.value)}
                  maxLength={200}
                  placeholder="Filling in for Jane / VIP comps only / etc."
                  className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addOverride}
                  disabled={!!busy}
                  className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  Pin to show
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPickContactId('')
                    setPickRole('')
                    setPickNote('')
                  }}
                  className="rounded-md border border-border-default px-3 py-1.5 text-xs font-medium hover:bg-surface-alt"
                >
                  Back
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setPickerOpen(false)
              setPickContactId('')
              setQuery('')
            }}
            className="mt-3 text-xs text-text-muted hover:text-text-secondary"
          >
            Close
          </button>
        </div>
      )}
    </section>
  )
}
