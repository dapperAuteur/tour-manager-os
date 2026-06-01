'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  createFestivalSlot,
  deleteFestivalSlot,
  updateFestivalSlot,
} from '@/lib/festival/actions'

interface Slot {
  id: string
  stage_id: string | null
  stage_name: string | null
  package_act_id: string | null
  act_name: string
  set_start_at: string | null
  set_length_minutes: number | null
  notes: string | null
}

interface Stage {
  id: string
  name: string
  location: string
}

interface Act {
  id: string
  act_name: string
  act_type: string
}

export function FestivalLineup({
  tourId,
  showId,
  slots,
  stages,
  acts,
}: {
  tourId: string
  showId: string
  slots: Slot[]
  stages: Stage[]
  acts: Act[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  function refresh() {
    startTransition(() => router.refresh())
  }

  // Group slots by stage so the grid reads like a festival schedule.
  const byStage = new Map<string | null, Slot[]>()
  for (const s of slots) {
    const key = s.stage_id
    if (!byStage.has(key)) byStage.set(key, [])
    byStage.get(key)!.push(s)
  }
  // Sort each stage's slots by start time.
  for (const list of byStage.values()) {
    list.sort((a, b) => (a.set_start_at || '').localeCompare(b.set_start_at || ''))
  }

  const stageList: Stage[] = [...stages]
  // Add a synthetic "Unassigned" bucket for slots with no stage.
  const unassignedSlots = byStage.get(null) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {slots.length === 0
            ? 'No slots yet. Add the first act.'
            : `${slots.length} slot${slots.length === 1 ? '' : 's'} across ${stages.length || 'no'} stage${stages.length === 1 ? '' : 's'}`}
        </p>
        {!adding && !editingId && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 dark:text-primary-300"
          >
            <Plus className="size-3" aria-hidden /> Add slot
          </button>
        )}
      </div>

      {adding && (
        <SlotForm
          stages={stages}
          acts={acts}
          submitLabel="Add to lineup"
          action={(form) => createFestivalSlot(tourId, showId, form)}
          onDone={() => {
            setAdding(false)
            refresh()
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {stages.length === 0 && unassignedSlots.length === 0 && (
        <div className="rounded-xl border border-warning-500/30 bg-warning-500/5 p-5 text-sm">
          <p>
            This venue has no stages on file. Add stages on the venue
            profile first so you can assign acts to them. Alternatively,
            add slots without a stage — they&apos;ll show under
            &ldquo;Unassigned&rdquo;.
          </p>
        </div>
      )}

      {stageList.map((stage) => {
        const stageSlots = byStage.get(stage.id) || []
        if (stageSlots.length === 0) return null
        return (
          <section
            key={stage.id}
            aria-label={`${stage.name} schedule`}
            className="rounded-xl border border-border-default bg-surface-raised p-5"
          >
            <header className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                {stage.name}
              </h2>
              <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                {stage.location}
              </span>
            </header>
            <ul className="space-y-2">
              {stageSlots.map((s) => renderSlot(s))}
            </ul>
          </section>
        )
      })}

      {unassignedSlots.length > 0 && (
        <section
          aria-label="Unassigned slots"
          className="rounded-xl border border-border-default bg-surface-raised p-5"
        >
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Unassigned
          </h2>
          <ul className="space-y-2">
            {unassignedSlots.map((s) => renderSlot(s))}
          </ul>
        </section>
      )}
    </div>
  )

  function renderSlot(s: Slot) {
    if (editingId === s.id) {
      return (
        <li key={s.id}>
          <SlotForm
            initial={s}
            stages={stages}
            acts={acts}
            submitLabel="Save"
            action={(form) => updateFestivalSlot(tourId, showId, s.id, form)}
            onDone={() => {
              setEditingId(null)
              refresh()
            }}
            onCancel={() => setEditingId(null)}
          />
        </li>
      )
    }
    const start = s.set_start_at ? new Date(s.set_start_at) : null
    return (
      <li
        key={s.id}
        className="flex items-start justify-between gap-3 rounded-md border border-border-default bg-surface p-3"
      >
        <div className="min-w-0">
          <p className="font-semibold">{s.act_name}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted">
            {start && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                {start.toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
            {s.set_length_minutes && <span>{s.set_length_minutes} min</span>}
            {s.notes && <span className="italic">&ldquo;{s.notes}&rdquo;</span>}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setEditingId(s.id)
              setAdding(false)
            }}
            aria-label={`Edit ${s.act_name}`}
            className="rounded p-1 text-text-muted hover:bg-surface-alt"
          >
            <Pencil className="size-3.5" aria-hidden />
          </button>
          <DeleteSlotButton
            tourId={tourId}
            showId={showId}
            slotId={s.id}
            name={s.act_name}
            onDone={refresh}
          />
        </div>
      </li>
    )
  }
}

function SlotForm({
  initial,
  stages,
  acts,
  submitLabel,
  action,
  onDone,
  onCancel,
}: {
  initial?: Slot
  stages: Stage[]
  acts: Act[]
  submitLabel: string
  action: (form: FormData) => Promise<{ ok: true } | { error: string }>
  onDone: () => void
  onCancel: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handle(formData: FormData) {
    setError(null)
    setBusy(true)
    const result = await action(formData)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    onDone()
  }

  const initialStart = initial?.set_start_at
    ? new Date(initial.set_start_at).toISOString().slice(0, 16)
    : ''

  return (
    <form action={handle} className="space-y-3 rounded-md border border-primary-500/30 bg-primary-500/5 p-3">
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Stage</span>
          <select
            name="stage_id"
            defaultValue={initial?.stage_id || ''}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            <option value="">— No stage assigned —</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.location})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Act</span>
          <select
            name="package_act_id"
            defaultValue={initial?.package_act_id || ''}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            <option value="">— Use override below —</option>
            {acts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.act_name} ({a.act_type})
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">
          Or type an act name (overrides selection above)
        </span>
        <input
          type="text"
          name="act_name_override"
          maxLength={120}
          defaultValue={initial && !initial.package_act_id ? initial.act_name : ''}
          placeholder="Guest comedian / DJ Smith / etc."
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Start (date + time)</span>
          <input
            type="datetime-local"
            name="set_start_at"
            defaultValue={initialStart}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Set length (min)</span>
          <input
            type="number"
            name="set_length_minutes"
            min="1"
            max="600"
            defaultValue={initial?.set_length_minutes ?? ''}
            placeholder="45"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Notes (optional)</span>
        <input
          type="text"
          name="notes"
          maxLength={200}
          defaultValue={initial?.notes || ''}
          placeholder="Backstage entry from rear; needs extra monitor wedges"
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : submitLabel}
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

function DeleteSlotButton({
  tourId,
  showId,
  slotId,
  name,
  onDone,
}: {
  tourId: string
  showId: string
  slotId: string
  name: string
  onDone: () => void
}) {
  const [busy, setBusy] = useState(false)
  async function go() {
    if (!window.confirm(`Remove ${name} from the lineup?`)) return
    setBusy(true)
    const result = await deleteFestivalSlot(tourId, showId, slotId)
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
      onClick={go}
      disabled={busy}
      aria-label={`Delete ${name}`}
      className="rounded p-1 text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  )
}
