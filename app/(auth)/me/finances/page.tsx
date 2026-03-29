import type { Metadata } from 'next'
import { DollarSign, TrendingUp, Receipt, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMemberFinances } from '@/lib/finances/queries'

export const metadata: Metadata = {
  title: 'My Finances',
  robots: { index: false },
}

export default async function MyFinancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const data = await getMemberFinances(user.id)

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold">My Finances</h1>

      {/* Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">My Expenses</p>
            <Receipt className="h-5 w-5 text-text-muted" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(data.totalExpenses)}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Total Paid</p>
            <TrendingUp className="h-5 w-5 text-success-600 dark:text-success-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(data.totalPaid)}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Owed to Me</p>
            <DollarSign className="h-5 w-5 text-warning-600 dark:text-warning-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(data.totalOwed)}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Tax Deductible</p>
            <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(data.taxDeductible)}</p>
        </div>
      </div>

      {/* Expenses list */}
      <h2 className="mb-4 text-lg font-semibold">My Expenses ({data.expenses.length})</h2>
      {data.expenses.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Receipt className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No expenses recorded yet. Add expenses from a tour&apos;s finance page.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs text-text-muted">
                <th className="pb-2 pr-4" scope="col">Date</th>
                <th className="pb-2 pr-4" scope="col">Tour</th>
                <th className="pb-2 pr-4" scope="col">Category</th>
                <th className="pb-2 pr-4" scope="col">Description</th>
                <th className="pb-2 pr-4 text-right" scope="col">Amount</th>
                <th className="pb-2" scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-border-default">
                  <td className="py-3 pr-4">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {(expense.tours as { name: string })?.name || '—'}
                  </td>
                  <td className="py-3 pr-4 capitalize">{expense.category.replace('_', ' ')}</td>
                  <td className="py-3 pr-4 text-text-secondary">{expense.description || '—'}</td>
                  <td className="py-3 pr-4 text-right font-medium">{fmt(Number(expense.amount))}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      expense.status === 'approved' ? 'bg-success-500/20 text-success-600 dark:text-success-500'
                      : expense.status === 'rejected' ? 'bg-error-500/20 text-error-500'
                      : 'bg-text-muted/20 text-text-muted'
                    }`}>
                      {expense.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
