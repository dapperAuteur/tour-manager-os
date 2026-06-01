'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownLeft, ArrowUpRight, Check, Plus, Trash2, X } from 'lucide-react'
import {
  createMemberLoan,
  deleteOpenLoan,
  markLoanPaid,
  unmarkLoanPaid,
} from '@/lib/finances/loan-actions'

interface Loan {
  id: string
  amount: number
  reason: string | null
  status: 'open' | 'paid'
  paid_at: string | null
  paid_method: string | null
  tour_name: string | null
  lender_id: string
  lender_name: string | null
  borrower_id: string
  borrower_name: string | null
}

interface Counterparty {
  user_id: string
  display_name: string | null
}

interface Tour {
  id: string
  name: string
}

interface MemberLoansProps {
  iOwe: Loan[]
  owedToMe: Loan[]
  netOpen: number
  counterparties: Counterparty[]
  tours: Tour[]
}

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

export function MemberLoans({
  iOwe,
  owedToMe,
  netOpen,
  counterparties,
  tours,
}: MemberLoansProps) {
  const [open, setOpen] = useState(false)

  return (
    <section
      aria-label="Member loans"
      className="rounded-xl border border-border-default bg-surface-raised p-5"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Loans between band members
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Track money you&apos;ve loaned or borrowed from teammates.
            Doesn&apos;t affect tour P&amp;L.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs">
            <span className="text-text-muted">Open balance:</span>{' '}
            <span
              className={`font-semibold ${
                netOpen > 0
                  ? 'text-success-600 dark:text-success-500'
                  : netOpen < 0
                    ? 'text-error-600 dark:text-error-500'
                    : 'text-text-secondary'
              }`}
            >
              {netOpen > 0 ? '+' : ''}{fmt(netOpen)}
            </span>
          </p>
          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 dark:text-primary-300"
            >
              <Plus className="size-3" aria-hidden /> Add loan
            </button>
          )}
        </div>
      </header>

      {open && (
        <CreateLoanForm
          counterparties={counterparties}
          tours={tours}
          onDone={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <LoanColumn
          title="Owed to me"
          icon={ArrowDownLeft}
          tone="success"
          loans={owedToMe}
          counterpartyKey="borrower"
        />
        <LoanColumn
          title="I owe"
          icon={ArrowUpRight}
          tone="error"
          loans={iOwe}
          counterpartyKey="lender"
        />
      </div>
    </section>
  )
}

function CreateLoanForm({
  counterparties,
  tours,
  onDone,
  onCancel,
}: {
  counterparties: Counterparty[]
  tours: Tour[]
  onDone: () => void
  onCancel: () => void
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function action(formData: FormData) {
    setError(null)
    setBusy(true)
    const result = await createMemberLoan(formData)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
    onDone()
  }

  return (
    <form action={action} className="space-y-3 rounded-md border border-primary-500/30 bg-primary-500/5 p-3">
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">{error}</p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Direction</span>
          <select
            name="direction"
            defaultValue="i_lent"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            <option value="i_lent">I lent money to…</option>
            <option value="i_borrowed">I borrowed money from…</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">The other person</span>
          <select
            name="counterparty_id"
            required
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            <option value="">Pick a teammate…</option>
            {counterparties.map((c) => (
              <option key={c.user_id} value={c.user_id}>
                {c.display_name || 'Unnamed member'}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Amount (USD)</span>
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            required
            placeholder="5.00"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Tour (optional)</span>
          <select
            name="tour_id"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            <option value="">— Not tied to a tour —</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Reason (optional)</span>
        <input
          type="text"
          name="reason"
          maxLength={140}
          placeholder="Parking, gas at the BP, Saturday dinner, etc."
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Record loan'}
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

function LoanColumn({
  title,
  icon: Icon,
  tone,
  loans,
  counterpartyKey,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'success' | 'error'
  loans: Loan[]
  counterpartyKey: 'lender' | 'borrower'
}) {
  const openLoans = loans.filter((l) => l.status === 'open')
  const paidLoans = loans.filter((l) => l.status === 'paid').slice(0, 5)
  const openTotal = openLoans.reduce((s, l) => s + l.amount, 0)

  return (
    <div>
      <div className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-text-muted">
        <Icon
          className={`size-3 ${tone === 'success' ? 'text-success-600 dark:text-success-500' : 'text-error-600 dark:text-error-500'}`}
          aria-hidden
        />
        {title}
        <span className="ml-auto text-text-secondary">{fmt(openTotal)}</span>
      </div>
      {loans.length === 0 ? (
        <p className="text-xs text-text-muted">Nothing here.</p>
      ) : (
        <ul className="space-y-2">
          {[...openLoans, ...paidLoans].map((l) => {
            const otherName =
              counterpartyKey === 'borrower' ? l.borrower_name : l.lender_name
            return (
              <li
                key={l.id}
                className={`rounded-md border border-border-default bg-surface p-3 text-sm ${l.status === 'paid' ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {otherName || 'Unnamed member'}{' '}
                    <span className="text-text-muted">&middot;</span>{' '}
                    <span className="font-semibold">{fmt(l.amount)}</span>
                  </p>
                  <LoanActions loan={l} />
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted">
                  {l.tour_name && <span>{l.tour_name}</span>}
                  {l.reason && <span>&ldquo;{l.reason}&rdquo;</span>}
                  {l.status === 'paid' && l.paid_at && (
                    <span>
                      Paid {new Date(l.paid_at).toLocaleDateString()}
                      {l.paid_method ? ` via ${l.paid_method}` : ''}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function LoanActions({ loan }: { loan: Loan }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [askMethod, setAskMethod] = useState(false)
  const [method, setMethod] = useState('')
  const [busy, setBusy] = useState(false)

  const isCreatorAndOpen = loan.status === 'open' // policy allows any party to delete only own; UI lets either party try

  async function pay() {
    setBusy(true)
    const result = await markLoanPaid(loan.id, method)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    setAskMethod(false)
    setMethod('')
    startTransition(() => router.refresh())
  }
  async function unpay() {
    setBusy(true)
    const result = await unmarkLoanPaid(loan.id)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    startTransition(() => router.refresh())
  }
  async function remove() {
    if (!window.confirm('Delete this open loan?')) return
    setBusy(true)
    const result = await deleteOpenLoan(loan.id)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  if (loan.status === 'paid') {
    return (
      <button
        type="button"
        onClick={unpay}
        disabled={busy}
        className="rounded-md border border-border-default px-2 py-0.5 text-[10px] font-medium hover:bg-surface-alt disabled:opacity-50"
      >
        Reopen
      </button>
    )
  }

  if (askMethod) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          placeholder="Venmo / cash / etc."
          className="w-32 rounded-md border border-border-default bg-surface px-2 py-1 text-xs"
        />
        <button
          type="button"
          onClick={pay}
          disabled={busy}
          aria-label="Confirm paid"
          className="rounded-md bg-success-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-success-700 disabled:opacity-50"
        >
          <Check className="size-3" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setAskMethod(false)}
          aria-label="Cancel"
          className="rounded-md border border-border-default px-2 py-1 text-text-muted hover:bg-surface-alt"
        >
          <X className="size-3" aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setAskMethod(true)}
        className="inline-flex items-center gap-1 rounded-md bg-success-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-success-700"
      >
        <Check className="size-3" aria-hidden /> Mark paid
      </button>
      {isCreatorAndOpen && (
        <button
          type="button"
          onClick={remove}
          aria-label="Delete this open loan"
          className="rounded-md border border-error-500/40 px-1 py-0.5 text-error-600 hover:bg-error-500/10 dark:text-error-400"
        >
          <Trash2 className="size-3" aria-hidden />
        </button>
      )}
    </div>
  )
}
