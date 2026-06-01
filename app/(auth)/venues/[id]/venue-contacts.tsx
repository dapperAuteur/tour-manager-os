'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Pencil,
  Phone,
  Plus,
  Star,
  Tag,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import {
  createVenueContact,
  deleteVenueContact,
  updateVenueContact,
} from '@/lib/venues/contact-actions'
import { updateContactTags } from '@/lib/venues/contact-group-actions'

interface Contact {
  id: string
  role: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  is_primary: boolean
  tags?: string[] | null
}

interface VenueContactsProps {
  venueId: string
  initial: Contact[]
}

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'booker', label: 'Booker' },
  { value: 'production', label: 'Production' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'sound', label: 'Sound' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'merch', label: 'Merch' },
  { value: 'security', label: 'Security' },
  { value: 'house', label: 'House Manager' },
  { value: 'other', label: 'Other' },
]
const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label])) as Record<string, string>

export function VenueContacts({ venueId, initial }: VenueContactsProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  // Group contacts by role so the venue page reads like a directory.
  const byRole = initial.reduce<Record<string, Contact[]>>((acc, c) => {
    if (!acc[c.role]) acc[c.role] = []
    acc[c.role].push(c)
    return acc
  }, {})

  function refresh() {
    startTransition(() => router.refresh())
  }

  return (
    <section
      aria-label="Venue contacts"
      className="rounded-xl border border-border-default bg-surface-raised p-5"
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Contacts
        </h2>
        {!adding && (
          <button
            type="button"
            onClick={() => {
              setAdding(true)
              setEditingId(null)
            }}
            className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 dark:text-primary-300"
          >
            <Plus className="size-3" aria-hidden /> Add contact
          </button>
        )}
      </header>

      {adding && (
        <ContactForm
          venueId={venueId}
          submitLabel="Add contact"
          action={(form) => createVenueContact(venueId, form)}
          onDone={() => {
            setAdding(false)
            refresh()
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {initial.length === 0 && !adding && (
        <p className="text-sm text-text-muted">
          No contacts yet. Add the booker, production lead, hospitality lead,
          or whoever the band needs to reach.
        </p>
      )}

      <ul className="space-y-4">
        {Object.entries(byRole).map(([role, list]) => (
          <li key={role}>
            <div className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-text-muted">
              <UserRound className="size-3" aria-hidden />
              {ROLE_LABELS[role] || role}
            </div>
            <ul className="space-y-2">
              {list.map((c) =>
                editingId === c.id ? (
                  <li key={c.id}>
                    <ContactForm
                      venueId={venueId}
                      initial={c}
                      submitLabel="Save changes"
                      action={(form) => updateVenueContact(venueId, c.id, form)}
                      onDone={() => {
                        setEditingId(null)
                        refresh()
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </li>
                ) : (
                  <li
                    key={c.id}
                    className="rounded-md border border-border-default bg-surface p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-1.5 font-medium">
                          {c.name}
                          {c.is_primary && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-warning-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning-700 dark:text-warning-400"
                              title="Primary contact for this role"
                            >
                              <Star className="size-2.5 fill-current" aria-hidden /> Primary
                            </span>
                          )}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              className="inline-flex items-center gap-1 hover:text-text-secondary"
                            >
                              <Phone className="size-3" aria-hidden /> {c.phone}
                            </a>
                          )}
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="inline-flex items-center gap-1 hover:text-text-secondary"
                            >
                              <Mail className="size-3" aria-hidden /> {c.email}
                            </a>
                          )}
                        </div>
                        {c.notes && (
                          <p className="mt-1 whitespace-pre-wrap text-xs text-text-secondary">
                            {c.notes}
                          </p>
                        )}
                        <ContactTags
                          venueId={venueId}
                          contactId={c.id}
                          tags={c.tags || []}
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(c.id)
                            setAdding(false)
                          }}
                          className="inline-flex items-center rounded p-1 text-text-muted hover:bg-surface-alt"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </button>
                        <DeleteContactButton
                          venueId={venueId}
                          contactId={c.id}
                          name={c.name}
                          onDone={refresh}
                        />
                      </div>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface ContactFormProps {
  venueId: string
  initial?: Contact
  submitLabel: string
  action: (form: FormData) => Promise<{ ok: true } | { error: string }>
  onDone: () => void
  onCancel: () => void
}

function ContactForm({
  initial,
  submitLabel,
  action,
  onDone,
  onCancel,
}: ContactFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSubmitting(true)
    const result = await action(formData)
    if ('error' in result) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    onDone()
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-3 rounded-md border border-primary-500/30 bg-primary-500/5 p-3"
    >
      {error && (
        <div role="alert" className="rounded-md bg-error-500/10 p-2 text-xs text-error-600 dark:text-error-500">
          {error}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Role</span>
          <select
            name="role"
            defaultValue={initial?.role || 'booker'}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Name</span>
          <input
            type="text"
            name="name"
            required
            maxLength={120}
            defaultValue={initial?.name || ''}
            placeholder="e.g. Jane Smith"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Phone</span>
          <input
            type="tel"
            name="phone"
            defaultValue={initial?.phone || ''}
            placeholder="555-555-5555"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Email</span>
          <input
            type="email"
            name="email"
            defaultValue={initial?.email || ''}
            placeholder="name@venue.com"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Notes (optional)</span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={initial?.notes || ''}
          placeholder="Office hours, preferences, etc."
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_primary"
          defaultChecked={initial?.is_primary || false}
          className="rounded accent-primary-600"
        />
        Mark as primary for this role
      </label>
      <p className="text-[11px] text-text-muted">
        Phone or email is required. Marking primary will unset any other primary
        contact for the same role on this venue.
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-1.5 text-xs font-medium hover:bg-surface-alt"
        >
          <X className="size-3" aria-hidden /> Cancel
        </button>
      </div>
    </form>
  )
}

function DeleteContactButton({
  venueId,
  contactId,
  name,
  onDone,
}: {
  venueId: string
  contactId: string
  name: string
  onDone: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  async function onClick() {
    if (!window.confirm(`Delete contact "${name}"?`)) return
    setDeleting(true)
    const result = await deleteVenueContact(venueId, contactId)
    setDeleting(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    onDone()
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deleting}
      className="inline-flex items-center rounded p-1 text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
      aria-label={`Delete ${name}`}
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  )
}

function ContactTags({
  venueId,
  contactId,
  tags,
}: {
  venueId: string
  contactId: string
  tags: string[]
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(tags.join(', '))
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const result = await updateContactTags(venueId, contactId, value)
    setSaving(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="comma, separated, tags"
          aria-label="Edit contact tags"
          className="flex-1 rounded-md border border-border-default bg-surface px-2 py-1 text-xs"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-md bg-primary-600 px-2 py-1 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? '…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(tags.join(', '))
            setEditing(false)
          }}
          className="text-xs text-text-muted hover:text-text-secondary"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {tags.length > 0 ? (
        tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:text-primary-300"
          >
            <Tag className="size-2.5" aria-hidden /> {t}
          </span>
        ))
      ) : null}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-[10px] text-text-muted underline-offset-2 hover:underline"
      >
        {tags.length > 0 ? 'Edit tags' : '+ Add tags'}
      </button>
    </div>
  )
}
