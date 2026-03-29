import type { Metadata } from 'next'
import Link from 'next/link'
import { DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { getTourFinances } from '@/lib/finances/queries'
import { ExportCsvButton } from './export-csv-button'

export const metadata: Metadata = {
  title: 'Tour Finances',
  robots: { index: false },
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

const categoryLabels: Record<string, string> = {
  travel: 'Travel',
  hotel: 'Hotel',
  per_diem: 'Per Diem',
  meals: 'Meals',
  equipment: 'Equipment',
  crew: 'Crew',
  merch: 'Merch',
  marketing: 'Marketing',
  insurance: 'Insurance',
  other: 'Other',
}

export default async function TourFinancesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tourId } = await params
  const data = await getTourFinances(tourId)

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href={`/tours/${tourId}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">
        &larr; Back to Tour
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tour Finances</h1>
        <div className="flex gap-2">
          <ExportCsvButton expenses={data.expenses} />
          <Link
            href={`/tours/${tourId}/finances/expenses/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Expense
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={fmt(data.totalRevenue)} icon={TrendingUp} color="text-success-600 dark:text-success-500" />
        <StatCard label="Total Expenses" value={fmt(data.totalExpenses)} icon={TrendingDown} color="text-error-500" />
        <StatCard
          label="Net Profit"
          value={`${data.netProfit < 0 ? '-' : ''}${fmt(data.netProfit)}`}
          icon={DollarSign}
          color={data.netProfit >= 0 ? 'text-success-600 dark:text-success-500' : 'text-error-500'}
        />
      </div>

      {/* Expenses by category */}
      {Object.keys(data.expensesByCategory).length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Expenses by Category</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between rounded-lg border border-border-default bg-surface-raised px-4 py-3">
                  <span className="text-sm">{categoryLabels[category] || category}</span>
                  <span className="text-sm font-semibold">{fmt(amount)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent expenses */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Expenses ({data.expenses.length})</h2>
        {data.expenses.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
            <DollarSign className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-xs text-text-muted">
                  <th className="pb-2 pr-4" scope="col">Date</th>
                  <th className="pb-2 pr-4" scope="col">Category</th>
                  <th className="pb-2 pr-4" scope="col">Description</th>
                  <th className="pb-2 pr-4 text-right" scope="col">Amount</th>
                  <th className="pb-2 pr-4" scope="col">Status</th>
                  <th className="pb-2" scope="col">Tax</th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-border-default">
                    <td className="py-3 pr-4">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">{categoryLabels[expense.category] || expense.category}</td>
                    <td className="py-3 pr-4 text-text-secondary">{expense.description || '—'}</td>
                    <td className="py-3 pr-4 text-right font-medium">{fmt(Number(expense.amount))}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        expense.status === 'approved' ? 'bg-success-500/20 text-success-600 dark:text-success-500'
                        : expense.status === 'rejected' ? 'bg-error-500/20 text-error-500'
                        : 'bg-text-muted/20 text-text-muted'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="py-3">{expense.is_tax_deductible ? '✓' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
