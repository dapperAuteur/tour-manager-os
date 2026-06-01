'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ExternalLink, Plus, SkipForward, Trash2, X } from 'lucide-react'
import {
  createDayOffPlan,
  deleteDayOffPlan,
  updatePlanStatus,
} from '@/lib/days-off/actions'

interface Plan {
  id: string
  date: string
  member_user_id: string | null
  member_name: string | null
  activity_type: string
  title: string
  description: string | null
  location_name: string | null
  location_url: string | null
  status: 'planned' | 'done' | 'skipped'
}

interface Suggestion {
  label: string
  href: string
  activity: string
}

interface Slot {
  date: string
  city: string | null
  state: string | null
  plans: Plan[]
  suggestions: Suggestion[]
}

const ACTIVITY_LABELS: Record<string, string> = {
  rest: 'Rest',
  sightseeing: 'Sightseeing',
  gym: 'Gym',
  spa: 'Spa',
  food: 'Food',
  family: 'Family',
  errands: 'Errands',
  other: 'Other',
}

export function DayOffSlots({
  tourId,
  slots,
}: {
  tourId: string
  slots: Slot[]
}) {
  const [addingForDate, setAddingForDate] = useState<string | null>(null)

  return (
    <ul className="space-y-4">
      {slots.map((slot) => {
        const d = new Date(slot.date)
        const dayLabel = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        return (
          <li
            key={slot.date}
            className="rounded-xl border border-border-default bg-surface-raised p-5"
          >
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{dayLabel}</p>
                <p className="text-xs text-text-muted">
                  {slot.city
                    ? `Near ${slot.city}${slot.state ? `, ${slot.state}` : ''}`
                    : 'Location TBD'}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAddingForDate(addingForDate === slot.date ? null : slot.date)
                }
                className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 dark:text-primary-300"
              >
                <Plus className="size-3" aria-hidden />{' '}
                {addingForDate === slot.date ? 'Close' : 'Add plan'}
              </button>
            </header>

            {addingForDate === slot.date && (
              <AddForm
                tourId={tourId}
                date={slot.date}
                onDone={() => setAddingForDate(null)}
              />
            )}

            {slot.plans.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {slot.plans.map((p) => (
                  <li key={p.id}>
                    <PlanRow tourId={tourId} plan={p} />
                  </li>
                ))}
              </ul>
            ) : (
              !addingForDate && (
                <p className="mt-1 text-xs text-text-muted">
                  Nothing planned yet.
                </p>
              )
            )}

            {/* Suggestions */}
            <div className="mt-4 border-t border-border-default pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Quick ideas {slot.city ? `for ${slot.city}` : ''}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {slot.suggestions.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border-default bg-surface px-2 py-0.5 text-[11px] text-text-secondary hover:border-primary-500/40 hover:text-text-primary"
                    >
                      {s.label}
                      <ExternalLink className="size-2.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function PlanRow({ tourId, plan }: { tourId: string; plan: Plan }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)

  async function setStatus(status: Plan['status']) {
    setBusy(true)
    const result = await updatePlanStatus(tourId, plan.id, status)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    startTransition(() => router.refresh())
  }
  async function remove() {
    if (!window.confirm(`Delete "${plan.title}"?`)) return
    setBusy(true)
    const result = await deleteDayOffPlan(tourId, plan.id)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 rounded-md border border-border-default bg-surface p-3 ${
        plan.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 font-medium">
          {plan.title}
          <span className="rounded-full bg-primary-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
            {ACTIVITY_LABELS[plan.activity_type] || plan.activity_type}
          </span>
          {plan.member_user_id ? (
            <span className="text-[10px] text-text-muted">
              {plan.member_name || 'A member'}
            </span>
          ) : (
            <span className="rounded-full bg-success-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success-700 dark:text-success-400">
              Group
            </span>
          )}
        </p>
        {plan.description && (
          <p className="mt-1 text-xs text-text-secondary">{plan.description}</p>
        )}
        {plan.location_name && (
          <p className="mt-1 text-xs">
            {plan.location_url ? (
              <a
                href={plan.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary-700 hover:underline dark:text-primary-400"
              >
                {plan.location_name}
                <ExternalLink className="size-2.5" aria-hidden />
              </a>
            ) : (
              <span className="text-text-muted">{plan.location_name}</span>
            )}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setStatus('done')}
          disabled={busy || plan.status === 'done'}
          aria-label="Mark done"
          title="Mark done"
          className="rounded p-1 text-success-600 hover:bg-success-500/10 disabled:opacity-30 dark:text-success-400"
        >
          <Check className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setStatus('skipped')}
          disabled={busy || plan.status === 'skipped'}
          aria-label="Skip"
          title="Mark skipped"
          className="rounded p-1 text-text-muted hover:bg-surface-alt disabled:opacity-30"
        >
          <SkipForward className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          aria-label="Delete plan"
          className="rounded p-1 text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  )
}

function AddForm({
  tourId,
  date,
  onDone,
}: {
  tourId: string
  date: string
  onDone: () => void
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function action(formData: FormData) {
    setError(null)
    setBusy(true)
    const result = await createDayOffPlan(tourId, formData)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
    onDone()
  }

  return (
    <form
      action={action}
      className="space-y-3 rounded-md border border-primary-500/30 bg-primary-500/5 p-3"
    >
      <input type="hidden" name="date" value={date} />
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Activity</span>
          <select
            name="activity_type"
            defaultValue="rest"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            {Object.entries(ACTIVITY_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium">Title</span>
          <input
            type="text"
            name="title"
            required
            maxLength={120}
            placeholder="Sunrise hike / Family dinner / Laundry"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Location (optional)</span>
          <input
            type="text"
            name="location_name"
            maxLength={120}
            placeholder="Riverside Trail / Lupe&apos;s Tacos"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Map link (optional)</span>
          <input
            type="url"
            name="location_url"
            placeholder="https://maps.google.com/?q=…"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Notes (optional)</span>
        <textarea
          name="description"
          rows={2}
          maxLength={500}
          placeholder="Meet in the lobby at 9. Bring water + shoes."
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" name="is_group" className="rounded accent-primary-600" />
        Group plan (whole party invited; uncheck for personal time)
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? 'Adding…' : 'Add plan'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-1.5 text-xs font-medium hover:bg-surface-alt"
        >
          <X className="size-3" aria-hidden /> Cancel
        </button>
      </div>
    </form>
  )
}
