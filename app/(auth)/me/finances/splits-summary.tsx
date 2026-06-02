'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Split } from 'lucide-react'
import { markSplitSettled, reopenSplit } from '@/lib/finances/split-actions'

interface OwedToOthers {
  split_id: string
  expense_id: string
  expense_description: string | null
  expense_date: string
  expense_category: string
  creditor_user_id: string | null
  creditor_name: string | null
  share_amount: number
}

interface OwedByOthers {
  split_id: string
  expense_id: string
  expense_description: string | null
  expense_date: string
  expense_category: string
  debtor_user_id: string
  debtor_name: string | null
  share_amount: number
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

function fmt(n: number) {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export function SplitsSummary({
  owedToOthers,
  owedByOthers,
  netOwed,
}: {
  owedToOthers: OwedToOthers[]
  owedByOthers: OwedByOthers[]
  netOwed: number
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function settle(splitId: string, method: string) {
    setBusy(splitId)
    setError(null)
    const result = await markSplitSettled(splitId, method)
    setBusy(null)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  async function undo(splitId: string) {
    setBusy(splitId)
    setError(null)
    const result = await reopenSplit(splitId)
    setBusy(null)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <section
      aria-labelledby="splits-summary"
      className="rounded-xl border border-border-default bg-surface-raised p-5"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="splits-summary" className="flex items-center gap-2 font-semibold">
          <Split className="size-4" aria-hidden /> Expense splits
        </h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            netOwed >= 0
              ? 'bg-success-500/15 text-success-700 dark:text-success-300'
              : 'bg-warning-500/15 text-warning-700 dark:text-warning-300'
          }`}
        >
          {netOwed >= 0 ? `Net +${fmt(netOwed)} owed to you` : `Net ${fmt(netOwed)} you owe`}
        </span>
      </header>

      {error && (
        <p role="alert" className="mb-3 text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}

      {owedToOthers.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            You owe
          </h3>
          <ul className="space-y-2">
            {owedToOthers.map((r) => (
              <li
                key={r.split_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-default bg-surface p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p>
                    <span className="font-semibold">{fmt(r.share_amount)}</span>{' '}
                    <ArrowRight className="inline size-3 text-text-muted" aria-hidden />{' '}
                    <span className="font-medium">
                      {r.creditor_name || 'A member'}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {r.expense_description || r.expense_category} ·{' '}
                    {new Date(r.expense_date).toLocaleDateString()}
                  </p>
                </div>
                <select
                  onChange={(e) => e.target.value && settle(r.split_id, e.target.value)}
                  defaultValue=""
                  disabled={busy === r.split_id}
                  className="rounded-md border border-border-default bg-surface px-2 py-1 text-xs"
                >
                  <option value="">Mark paid…</option>
                  {Object.entries(METHOD_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      {owedByOthers.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            People owe you
          </h3>
          <ul className="space-y-2">
            {owedByOthers.map((r) => (
              <li
                key={r.split_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-default bg-surface p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p>
                    <span className="font-medium">{r.debtor_name || 'A member'}</span>{' '}
                    <ArrowRight className="inline size-3 text-text-muted" aria-hidden />{' '}
                    <span className="font-semibold">{fmt(r.share_amount)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {r.expense_description || r.expense_category} ·{' '}
                    {new Date(r.expense_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => e.target.value && settle(r.split_id, e.target.value)}
                    defaultValue=""
                    disabled={busy === r.split_id}
                    className="rounded-md border border-border-default bg-surface px-2 py-1 text-xs"
                  >
                    <option value="">Mark received…</option>
                    {Object.entries(METHOD_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => undo(r.split_id)}
                    disabled={busy === r.split_id}
                    className="text-xs text-text-muted hover:text-text-secondary"
                  >
                    Undo
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
