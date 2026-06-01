'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Ruler, Trash2, X } from 'lucide-react'
import {
  createVenueStage,
  deleteVenueStage,
  updateVenueStage,
} from '@/lib/venues/stage-actions'

interface Stage {
  id: string
  name: string
  location: string
  capacity: number | null
  stage_width: number | null
  stage_depth: number | null
  stage_height: number | null
  pa_system: string | null
  notes: string | null
}

const LOCATION_OPTIONS: { value: string; label: string }[] = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'tent', label: 'Tent' },
  { value: 'other', label: 'Other' },
]
const LOCATION_LABELS = Object.fromEntries(
  LOCATION_OPTIONS.map((l) => [l.value, l.label]),
) as Record<string, string>

export function VenueStages({
  venueId,
  initial,
}: {
  venueId: string
  initial: Stage[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  function refresh() {
    startTransition(() => router.refresh())
  }

  return (
    <section
      aria-label="Venue stages"
      className="rounded-xl border border-border-default bg-surface-raised p-5"
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Stages &amp; Spaces
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
            <Plus className="size-3" aria-hidden /> Add stage
          </button>
        )}
      </header>

      {adding && (
        <StageForm
          submitLabel="Add stage"
          action={(form) => createVenueStage(venueId, form)}
          onDone={() => {
            setAdding(false)
            refresh()
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {initial.length === 0 && !adding && (
        <p className="text-sm text-text-muted">
          No stages or spaces listed yet. Festivals and multi-room
          clubs benefit from explicit indoor / outdoor / tent labels
          per stage. Add the main stage first.
        </p>
      )}

      <ul className="mt-3 space-y-2">
        {initial.map((s) =>
          editingId === s.id ? (
            <li key={s.id}>
              <StageForm
                initial={s}
                submitLabel="Save"
                action={(form) => updateVenueStage(venueId, s.id, form)}
                onDone={() => {
                  setEditingId(null)
                  refresh()
                }}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li
              key={s.id}
              className="rounded-md border border-border-default bg-surface p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 font-medium">
                    {s.name}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        s.location === 'outdoor'
                          ? 'bg-success-500/15 text-success-700 dark:text-success-400'
                          : s.location === 'tent'
                            ? 'bg-warning-500/15 text-warning-700 dark:text-warning-400'
                            : 'bg-primary-500/15 text-primary-700 dark:text-primary-300'
                      }`}
                    >
                      {LOCATION_LABELS[s.location] || s.location}
                    </span>
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                    {s.capacity != null && (
                      <span>Cap: {s.capacity.toLocaleString()}</span>
                    )}
                    {s.stage_width != null && s.stage_depth != null && (
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="size-3" aria-hidden />
                        {s.stage_width} &times; {s.stage_depth}
                        {s.stage_height != null ? ` × ${s.stage_height}` : ''} ft
                      </span>
                    )}
                    {s.pa_system && <span>PA: {s.pa_system}</span>}
                  </div>
                  {s.notes && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-text-secondary">
                      {s.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(s.id)
                      setAdding(false)
                    }}
                    className="inline-flex items-center rounded p-1 text-text-muted hover:bg-surface-alt"
                    aria-label={`Edit ${s.name}`}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                  </button>
                  <DeleteStageButton
                    venueId={venueId}
                    stageId={s.id}
                    name={s.name}
                    onDone={refresh}
                  />
                </div>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  )
}

interface StageFormProps {
  initial?: Stage
  submitLabel: string
  action: (form: FormData) => Promise<{ ok: true } | { error: string }>
  onDone: () => void
  onCancel: () => void
}

function StageForm({
  initial,
  submitLabel,
  action,
  onDone,
  onCancel,
}: StageFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handle(formData: FormData) {
    setError(null)
    setSubmitting(true)
    const result = await action(formData)
    setSubmitting(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    onDone()
  }

  return (
    <form
      action={handle}
      className="space-y-3 rounded-md border border-primary-500/30 bg-primary-500/5 p-3"
    >
      {error && (
        <div role="alert" className="rounded-md bg-error-500/10 p-2 text-xs text-error-600 dark:text-error-500">
          {error}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Name</span>
          <input
            type="text"
            name="name"
            required
            maxLength={80}
            defaultValue={initial?.name || ''}
            placeholder="Main Stage / Side Stage / Tent A"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Location</span>
          <select
            name="location"
            defaultValue={initial?.location || 'indoor'}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            {LOCATION_OPTIONS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Capacity</span>
          <input
            type="number"
            name="capacity"
            min="0"
            defaultValue={initial?.capacity ?? ''}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Width (ft)</span>
          <input
            type="number"
            name="width"
            step="0.1"
            min="0"
            defaultValue={initial?.stage_width ?? ''}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Depth (ft)</span>
          <input
            type="number"
            name="depth"
            step="0.1"
            min="0"
            defaultValue={initial?.stage_depth ?? ''}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Height (ft)</span>
          <input
            type="number"
            name="height"
            step="0.1"
            min="0"
            defaultValue={initial?.stage_height ?? ''}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">PA system (optional)</span>
        <input
          type="text"
          name="pa_system"
          maxLength={120}
          defaultValue={initial?.pa_system || ''}
          placeholder="L-Acoustics K2 / d&b V-Series / etc."
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Notes (optional)</span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={initial?.notes || ''}
          placeholder="Riser height, monitor world location, etc."
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
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

function DeleteStageButton({
  venueId,
  stageId,
  name,
  onDone,
}: {
  venueId: string
  stageId: string
  name: string
  onDone: () => void
}) {
  const [busy, setBusy] = useState(false)
  async function onClick() {
    if (!window.confirm(`Delete stage "${name}"?`)) return
    setBusy(true)
    const result = await deleteVenueStage(venueId, stageId)
    setBusy(false)
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
      disabled={busy}
      className="inline-flex items-center rounded p-1 text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
      aria-label={`Delete ${name}`}
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  )
}
