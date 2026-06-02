'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Plus, RotateCcw, Trash2, Users } from 'lucide-react'
import {
  createExpenseSplits,
  deleteSplit,
  markSplitSettled,
  reopenSplit,
} from '@/lib/finances/split-actions'
import type { ExpenseSplitRow } from '@/lib/finances/split-queries'

interface Member {
  user_id: string
  display_name: string
}

interface DraftShare {
  user_id: string
  amount: string
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  venmo: 'Venmo',
  zelle: 'Zelle',
  paypal: 'PayPal',
  cash_app: 'Cash App',
  bank: 'Bank',
  other: 'Other',
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function SplitEditor({
  expenseId,
  expenseAmount,
  members,
  currentUserId,
  filerUserId,
  initialSplits,
}: {
  expenseId: string
  expenseAmount: number
  members: Member[]
  currentUserId: string
  filerUserId: string | null
  initialSplits: ExpenseSplitRow[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const initialDraft: DraftShare[] = useMemo(() => {
    if (initialSplits.length > 0) {
      return initialSplits.map((s) => ({
        user_id: s.user_id,
        amount: s.share_amount.toFixed(2),
      }))
    }
    if (members.length === 0) return []
    const each = round2(expenseAmount / members.length)
    return members.map((m) => ({ user_id: m.user_id, amount: each.toFixed(2) }))
  }, [initialSplits, members, expenseAmount])
  const [draft, setDraft] = useState<DraftShare[]>(initialDraft)

  const draftTotal = useMemo(
    () => draft.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0),
    [draft],
  )

  function setShare(i: number, patch: Partial<DraftShare>) {
    setDraft((d) => d.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  }
  function addRow() {
    const taken = new Set(draft.map((d) => d.user_id))
    const next = members.find((m) => !taken.has(m.user_id))
    if (!next) return
    setDraft((d) => [...d, { user_id: next.user_id, amount: '0.00' }])
  }
  function removeRow(i: number) {
    setDraft((d) => d.filter((_, idx) => idx !== i))
  }
  function splitEvenly() {
    if (draft.length === 0) return
    const each = round2(expenseAmount / draft.length)
    setDraft((d) => d.map((row) => ({ ...row, amount: each.toFixed(2) })))
  }

  async function save() {
    setError(null)
    setBusy(true)
    const result = await createExpenseSplits({
      expenseId,
      expenseAmount,
      shares: draft.map((s) => ({
        user_id: s.user_id,
        share_amount: parseFloat(s.amount) || 0,
      })),
    })
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  async function settle(splitId: string, method: string) {
    setBusy(true)
    const result = await markSplitSettled(splitId, method)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }
  async function reopen(splitId: string) {
    setBusy(true)
    const result = await reopenSplit(splitId)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }
  async function remove(splitId: string) {
    if (!window.confirm('Delete this share?')) return
    setBusy(true)
    const result = await deleteSplit(splitId)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  const totalsMatch = Math.abs(draftTotal - expenseAmount) <= 0.01

  return (
    <div className="space-y-8">
      {/* Editor */}
      <section
        aria-labelledby="splits-editor"
        className="rounded-xl border border-border-default bg-surface-raised p-5"
      >
        <header className="mb-4 flex items-center justify-between gap-2">
          <h2 id="splits-editor" className="flex items-center gap-2 font-semibold">
            <Users className="size-4" aria-hidden /> Who covered this with you
          </h2>
          <button
            type="button"
            onClick={splitEvenly}
            disabled={draft.length === 0}
            className="rounded-md border border-border-default px-2 py-1 text-xs hover:bg-surface-alt disabled:opacity-40"
          >
            Split evenly
          </button>
        </header>

        {error && (
          <p role="alert" className="mb-3 text-xs text-error-600 dark:text-error-500">
            {error}
          </p>
        )}

        {members.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No other org members to split with.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {draft.map((row, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <select
                    value={row.user_id}
                    onChange={(e) => setShare(i, { user_id: e.target.value })}
                    className="min-w-[10rem] rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
                  >
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.display_name}
                        {m.user_id === currentUserId ? ' (you)' : ''}
                        {m.user_id === filerUserId ? ' — filer' : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-text-muted">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.amount}
                    onChange={(e) => setShare(i, { amount: e.target.value })}
                    className="w-24 rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label="Remove share"
                    className="rounded p-1 text-error-600 hover:bg-error-500/10 dark:text-error-400"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={addRow}
                disabled={draft.length >= members.length}
                className="inline-flex items-center gap-1 rounded-md border border-border-default px-2 py-1 text-xs disabled:opacity-40"
              >
                <Plus className="size-3" aria-hidden /> Add member
              </button>
              <p className="text-xs">
                <span className={totalsMatch ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400'}>
                  Total ${draftTotal.toFixed(2)}
                </span>{' '}
                of ${expenseAmount.toFixed(2)}
              </p>
              <button
                type="button"
                onClick={save}
                disabled={busy || !totalsMatch || draft.length === 0}
                className="ml-auto rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Save splits'}
              </button>
            </div>
          </>
        )}
      </section>

      {/* Existing splits */}
      {initialSplits.length > 0 && (
        <section
          aria-labelledby="existing-splits"
          className="rounded-xl border border-border-default bg-surface-raised p-5"
        >
          <h2 id="existing-splits" className="mb-3 font-semibold">
            Current shares
          </h2>
          <ul className="space-y-2">
            {initialSplits.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-default bg-surface p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {s.member_name || 'Member'}{' '}
                    {s.user_id === currentUserId && (
                      <span className="text-text-muted">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted">
                    ${s.share_amount.toFixed(2)} ·{' '}
                    {s.status === 'settled'
                      ? `Settled${s.settled_method ? ` via ${METHOD_LABELS[s.settled_method] || s.settled_method}` : ''}`
                      : s.status === 'waived'
                      ? 'Waived'
                      : 'Owed'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {s.status === 'owed' ? (
                    <select
                      onChange={(e) =>
                        e.target.value && settle(s.id, e.target.value)
                      }
                      defaultValue=""
                      disabled={busy}
                      className="rounded-md border border-border-default bg-surface px-2 py-1 text-xs"
                    >
                      <option value="">Mark settled…</option>
                      {Object.entries(METHOD_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => reopen(s.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 rounded p-1 text-xs text-text-muted hover:bg-surface-alt"
                    >
                      <RotateCcw className="size-3" aria-hidden /> Reopen
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    disabled={busy}
                    aria-label="Delete share"
                    className="rounded p-1 text-error-600 hover:bg-error-500/10 dark:text-error-400"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                  {s.status === 'settled' && (
                    <Check className="size-4 text-success-600 dark:text-success-400" aria-hidden />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
