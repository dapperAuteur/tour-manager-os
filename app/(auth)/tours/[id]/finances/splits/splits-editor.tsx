'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import {
  deleteRevenueSplit,
  upsertRevenueSplit,
} from '@/lib/stripe-connect/actions'
import type { RevenueSplitRow } from '@/lib/stripe-connect/queries'

interface Member {
  user_id: string
  display_name: string
  role: string
}

export function SplitsEditor({
  tourId,
  initialSplits,
  members,
}: {
  tourId: string
  initialSplits: RevenueSplitRow[]
  members: Member[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bpTotal = useMemo(
    () =>
      initialSplits
        .filter((s) => s.active)
        .reduce((s, r) => s + r.percent_basis_points, 0),
    [initialSplits],
  )
  const totalPercent = (bpTotal / 100).toFixed(2)
  const totalOk = bpTotal === 10000

  async function onSave(formData: FormData) {
    setBusy(true)
    setError(null)
    const result = await upsertRevenueSplit(tourId, formData)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setAdding(false)
    startTransition(() => router.refresh())
  }

  async function remove(splitId: string) {
    if (!window.confirm('Remove this split row?')) return
    setBusy(true)
    const result = await deleteRevenueSplit(tourId, splitId)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  // Members not yet allocated.
  const used = new Set(initialSplits.map((s) => s.payee_user_id))
  const availableMembers = members.filter((m) => !used.has(m.user_id))

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center justify-between rounded-md border p-3 text-sm ${
          totalOk
            ? 'border-success-500/30 bg-success-500/10 text-success-700 dark:text-success-300'
            : bpTotal === 0
            ? 'border-border-default bg-surface text-text-secondary'
            : 'border-warning-500/30 bg-warning-500/10 text-warning-700 dark:text-warning-300'
        }`}
      >
        <span>Total allocated: <strong>{totalPercent}%</strong></span>
        <span className="text-xs">
          {totalOk
            ? '100% — ready to route payouts.'
            : `Need ${(100 - parseFloat(totalPercent)).toFixed(2)}% more to enable payouts.`}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}

      {initialSplits.length === 0 && !adding ? (
        <p className="rounded-md border border-border-default bg-surface-raised p-4 text-sm text-text-secondary">
          No splits configured yet. Add one row per payee, allocate a
          percent, and total to 100%.
        </p>
      ) : (
        <ul className="space-y-2">
          {initialSplits.map((s) => (
            <li
              key={s.id}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-default p-3 text-sm ${
                s.active ? 'bg-surface' : 'bg-surface opacity-60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {s.payee_name || 'Member'}
                  {s.role && (
                    <span className="ml-2 rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                      {s.role}
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-muted">
                  {(s.percent_basis_points / 100).toFixed(2)}%
                  {s.stripe_account_id
                    ? ` · routes to Stripe account ${s.stripe_account_id.slice(0, 12)}…`
                    : ' · settled off-platform until Stripe account attached'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(s.id)}
                disabled={busy}
                aria-label="Remove split"
                className="rounded p-1 text-error-600 hover:bg-error-500/10 dark:text-error-400"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          action={onSave}
          className="space-y-3 rounded-xl border border-primary-500/30 bg-primary-500/5 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Payee</span>
              <select
                name="payee_user_id"
                required
                className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
              >
                {availableMembers.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.display_name} ({m.role})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Percent</span>
              <input
                type="number"
                name="percent"
                min={0.01}
                max={100}
                step={0.01}
                required
                className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">
                Role (optional)
              </span>
              <input
                type="text"
                name="role"
                maxLength={40}
                placeholder="artist / venue / crew"
                className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">
                Stripe account id (optional)
              </span>
              <input
                type="text"
                name="stripe_account_id"
                placeholder="acct_…"
                className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || availableMembers.length === 0}
              className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save split'}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-md border border-border-default px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={availableMembers.length === 0}
          className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 disabled:opacity-40 dark:text-primary-300"
        >
          <Plus className="size-3" aria-hidden /> Add split
        </button>
      )}
    </div>
  )
}
