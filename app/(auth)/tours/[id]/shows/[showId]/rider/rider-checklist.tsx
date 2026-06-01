'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, CircleDot, FileDown, MinusCircle, Plus, Trash2, XCircle } from 'lucide-react'
import {
  addRiderCheck,
  deleteRiderCheck,
  importOrgRiderTemplate,
  updateRiderCheckStatus,
} from '@/lib/rider/actions'

interface Check {
  id: string
  category: string
  description: string
  expected_quantity: number | null
  actual_quantity: number | null
  status: 'pending' | 'delivered' | 'partial' | 'missing' | 'na'
  notes: string | null
  checked_at: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical',
  hospitality: 'Hospitality',
  dressing_room: 'Dressing Room',
  crew: 'Crew',
  transportation: 'Transportation',
  security: 'Security',
  other: 'Other',
}

const STATUS_PILL: Record<Check['status'], string> = {
  pending: 'bg-text-muted/20 text-text-muted',
  delivered: 'bg-success-500/20 text-success-700 dark:text-success-400',
  partial: 'bg-warning-500/20 text-warning-700 dark:text-warning-400',
  missing: 'bg-error-500/20 text-error-700 dark:text-error-400',
  na: 'bg-primary-500/20 text-primary-700 dark:text-primary-300',
}

export function RiderChecklist({
  tourId,
  showId,
  initial,
  hasOrgTemplate,
}: {
  tourId: string
  showId: string
  initial: Check[]
  hasOrgTemplate: boolean
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function refresh() {
    startTransition(() => router.refresh())
  }

  async function importTemplate() {
    setBusy(true)
    setError(null)
    const result = await importOrgRiderTemplate(tourId, showId)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    refresh()
  }

  // Group by category for readability.
  const byCategory = new Map<string, Check[]>()
  for (const c of initial) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, [])
    byCategory.get(c.category)!.push(c)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {hasOrgTemplate && initial.length === 0 && (
          <button
            type="button"
            onClick={importTemplate}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <FileDown className="size-3" aria-hidden /> Import org template
          </button>
        )}
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 dark:text-primary-300"
          >
            <Plus className="size-3" aria-hidden /> Add line item
          </button>
        )}
        {error && (
          <p role="alert" className="text-xs text-error-600 dark:text-error-500">
            {error}
          </p>
        )}
      </div>

      {adding && (
        <AddForm
          tourId={tourId}
          showId={showId}
          onDone={() => {
            setAdding(false)
            refresh()
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {initial.length === 0 && !adding && !hasOrgTemplate && (
        <div className="rounded-xl border border-border-default bg-surface-raised p-6 text-sm text-text-muted">
          Nothing here yet. Set up a default rider at{' '}
          <a
            href="/settings/rider-template"
            className="text-primary-700 underline-offset-2 hover:underline dark:text-primary-400"
          >
            /settings/rider-template
          </a>{' '}
          or add a one-off line item with the button above.
        </div>
      )}

      {Array.from(byCategory.entries()).map(([category, list]) => (
        <section
          key={category}
          aria-labelledby={`cat-${category}`}
          className="rounded-xl border border-border-default bg-surface-raised p-4"
        >
          <h2
            id={`cat-${category}`}
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted"
          >
            {CATEGORY_LABELS[category] || category}
          </h2>
          <ul className="space-y-2">
            {list.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-border-default bg-surface p-3"
              >
                <CheckRow
                  c={c}
                  tourId={tourId}
                  showId={showId}
                  onDone={refresh}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function CheckRow({
  c,
  tourId,
  showId,
  onDone,
}: {
  c: Check
  tourId: string
  showId: string
  onDone: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [actual, setActual] = useState<string>(
    c.actual_quantity != null ? String(c.actual_quantity) : '',
  )
  const [notes, setNotes] = useState(c.notes || '')

  async function setStatus(status: Check['status']) {
    setBusy(true)
    const result = await updateRiderCheckStatus(
      tourId,
      showId,
      c.id,
      status,
      actual.trim() ? Number(actual) : null,
      notes,
    )
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    onDone()
  }

  async function remove() {
    if (!window.confirm('Remove this line item?')) return
    setBusy(true)
    const result = await deleteRiderCheck(tourId, showId, c.id)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    onDone()
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 font-medium">
          {c.description}
          {c.expected_quantity != null && (
            <span className="text-xs font-normal text-text-muted">
              (asked {c.expected_quantity})
            </span>
          )}
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_PILL[c.status]}`}
          >
            {c.status}
          </span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <label className="inline-flex items-center gap-1 text-text-muted">
            Actual:
            <input
              type="number"
              min="0"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className="w-16 rounded border border-border-default bg-surface px-1 py-0.5"
            />
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            placeholder="Note (e.g. sub'd hummus for hummus, no big deal)"
            className="min-w-0 flex-1 rounded border border-border-default bg-surface px-2 py-0.5 text-xs"
          />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <StatusButton
          icon={Check}
          tone="success"
          label="Delivered"
          disabled={busy}
          onClick={() => setStatus('delivered')}
        />
        <StatusButton
          icon={CircleDot}
          tone="warning"
          label="Partial"
          disabled={busy}
          onClick={() => setStatus('partial')}
        />
        <StatusButton
          icon={XCircle}
          tone="error"
          label="Missing"
          disabled={busy}
          onClick={() => setStatus('missing')}
        />
        <StatusButton
          icon={MinusCircle}
          tone="muted"
          label="N/A"
          disabled={busy}
          onClick={() => setStatus('na')}
        />
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          aria-label="Delete line item"
          className="rounded p-1 text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  )
}

function StatusButton({
  icon: Icon,
  tone,
  label,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone: 'success' | 'warning' | 'error' | 'muted'
  label: string
  disabled: boolean
  onClick: () => void
}) {
  const colors = {
    success: 'text-success-600 hover:bg-success-500/10 dark:text-success-400',
    warning: 'text-warning-600 hover:bg-warning-500/10 dark:text-warning-400',
    error: 'text-error-600 hover:bg-error-500/10 dark:text-error-400',
    muted: 'text-text-muted hover:bg-surface-alt',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded p-1 disabled:opacity-50 ${colors[tone]}`}
    >
      <Icon className="size-3.5" aria-hidden />
    </button>
  )
}

function AddForm({
  tourId,
  showId,
  onDone,
  onCancel,
}: {
  tourId: string
  showId: string
  onDone: () => void
  onCancel: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function action(formData: FormData) {
    setError(null)
    setBusy(true)
    const result = await addRiderCheck(tourId, showId, formData)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    onDone()
  }

  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-primary-500/30 bg-primary-500/5 p-4"
    >
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Category</span>
          <select
            name="category"
            defaultValue="hospitality"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium">Description</span>
          <input
            type="text"
            name="description"
            required
            maxLength={200}
            placeholder="2 bottles of still water per dressing room"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Expected qty</span>
          <input
            type="number"
            name="expected_quantity"
            min="0"
            placeholder="2"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium">Notes (optional)</span>
          <input
            type="text"
            name="notes"
            maxLength={200}
            placeholder="Any clarifications for the venue"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? 'Adding…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border-default px-3 py-1.5 text-xs font-medium hover:bg-surface-alt"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
