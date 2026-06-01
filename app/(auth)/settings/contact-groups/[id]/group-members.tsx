'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import {
  addContactToGroup,
  removeContactFromGroup,
} from '@/lib/venues/contact-group-actions'

interface Member {
  contact_id: string
  name: string
  role: string
  venue_id: string
  venue_name: string
}

interface Candidate {
  id: string
  name: string
  venue_name: string
  role: string
}

export function GroupMembers({
  groupId,
  members,
  candidates,
}: {
  groupId: string
  members: Member[]
  candidates: Candidate[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState('')

  const memberIds = useMemo(
    () => new Set(members.map((m) => m.contact_id)),
    [members],
  )
  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase()
    return candidates
      .filter((c) => !memberIds.has(c.id))
      .filter(
        (c) =>
          q.length === 0 ||
          c.name.toLowerCase().includes(q) ||
          c.venue_name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q),
      )
      .slice(0, 20)
  }, [candidates, memberIds, query])

  function refresh() {
    startTransition(() => router.refresh())
  }

  async function add(contactId: string) {
    setBusyId(contactId)
    const result = await addContactToGroup(groupId, contactId)
    setBusyId(null)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    refresh()
  }
  async function remove(contactId: string) {
    setBusyId(contactId)
    const result = await removeContactFromGroup(groupId, contactId)
    setBusyId(null)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    refresh()
  }

  return (
    <div>
      {members.length === 0 ? (
        <p className="text-sm text-text-muted">
          No contacts in this group yet. Add some below.
        </p>
      ) : (
        <ul className="mb-4 space-y-2">
          {members.map((m) => (
            <li
              key={m.contact_id}
              className="flex items-center justify-between gap-3 rounded-md border border-border-default bg-surface p-3"
            >
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-text-muted">
                  {m.role} &middot; {m.venue_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(m.contact_id)}
                disabled={busyId === m.contact_id}
                className="rounded-md border border-error-500/30 px-2 py-1 text-xs font-medium text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
                aria-label={`Remove ${m.name} from group`}
              >
                <X className="size-3" aria-hidden /> Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {!pickerOpen ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 dark:text-primary-300"
        >
          <Plus className="size-3" aria-hidden /> Add contacts
        </button>
      ) : (
        <div className="rounded-md border border-primary-500/30 bg-primary-500/5 p-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, venue, or role…"
            aria-label="Filter candidate contacts"
            className="mb-2 w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
          <p className="mb-2 text-[11px] text-text-muted">
            Showing first 20 matches. Use the search to narrow.
          </p>
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {filteredCandidates.length === 0 ? (
              <li className="text-xs text-text-muted">
                No more matching contacts.
              </li>
            ) : (
              filteredCandidates.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-surface p-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{c.name}</p>
                    <p className="truncate text-xs text-text-muted">
                      {c.role} &middot; {c.venue_name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => add(c.id)}
                    disabled={busyId === c.id}
                    className="rounded-md bg-primary-600 px-2 py-1 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="mt-3 text-xs text-text-muted hover:text-text-secondary"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
