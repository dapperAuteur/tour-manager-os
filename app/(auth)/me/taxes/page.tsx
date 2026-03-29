import type { Metadata } from 'next'
import { DollarSign, MapPin, Receipt, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTaxSummary, getDeductionCategories, getStateIncome } from '@/lib/taxes/queries'
import { TaxExportButton } from './tax-export-button'
import { YearSelector } from './year-selector'

export const metadata: Metadata = { title: 'Tax Center', robots: { index: false } }

export default async function TaxCenterPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const { year } = await searchParams
  const taxYear = year ? parseInt(year) : new Date().getFullYear()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [summary, categories, stateRecords] = await Promise.all([
    getTaxSummary(user.id, taxYear),
    getDeductionCategories(),
    getStateIncome(user.id, taxYear),
  ])

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const catMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tax Center</h1>
          <p className="text-sm text-text-secondary">Track income by state, deductions, and per diem for tax time.</p>
        </div>
        <div className="flex items-center gap-3">
          <YearSelector currentYear={taxYear} />
          <TaxExportButton userId={user.id} taxYear={taxYear} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Gross Income</p>
            <DollarSign className="h-5 w-5 text-success-600 dark:text-success-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(summary.totalIncome)}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Deductions</p>
            <Receipt className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(summary.totalDeductions)}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Per Diem</p>
            <FileText className="h-5 w-5 text-warning-600 dark:text-warning-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(summary.totalPerDiem)}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">States</p>
            <MapPin className="h-5 w-5 text-text-muted" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.statesPerformed}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* State breakdown */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Income by State</h2>
          {Object.keys(summary.stateBreakdown).length === 0 ? (
            <div className="rounded-xl border border-border-default bg-surface-raised p-6 text-center">
              <MapPin className="mx-auto mb-2 h-8 w-8 text-text-muted" aria-hidden="true" />
              <p className="text-sm text-text-secondary">No state income recorded for {taxYear}.</p>
              <p className="mt-1 text-xs text-text-muted">Income is auto-populated from your shows and revenue data.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(summary.stateBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([state, income]) => {
                  const pct = summary.totalIncome > 0 ? (income / summary.totalIncome) * 100 : 0
                  return (
                    <div key={state} className="rounded-lg border border-border-default bg-surface-raised p-3">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{state}</span>
                        <span className="font-semibold">{fmt(income)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-alt">
                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Deductions breakdown */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Deductions by Category</h2>
          {Object.keys(summary.deductionBreakdown).length === 0 ? (
            <div className="rounded-xl border border-border-default bg-surface-raised p-6 text-center">
              <Receipt className="mx-auto mb-2 h-8 w-8 text-text-muted" aria-hidden="true" />
              <p className="text-sm text-text-secondary">No deductions for {taxYear}.</p>
              <p className="mt-1 text-xs text-text-muted">Mark expenses as &ldquo;tax deductible&rdquo; when adding them.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(summary.deductionBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const category = catMap.get(cat)
                  return (
                    <div key={cat} className="rounded-lg border border-border-default bg-surface-raised p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{category?.name || cat}</span>
                          {category?.irs_guidance && (
                            <p className="mt-0.5 text-xs text-text-muted">{category.irs_guidance}</p>
                          )}
                        </div>
                        <span className="font-semibold">{fmt(amount)}</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* State income detail */}
      {stateRecords.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Income Detail ({stateRecords.length} performances)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-xs text-text-muted">
                  <th className="pb-2 pr-4" scope="col">Date</th>
                  <th className="pb-2 pr-4" scope="col">State</th>
                  <th className="pb-2 pr-4" scope="col">City</th>
                  <th className="pb-2 pr-4" scope="col">Venue</th>
                  <th className="pb-2 text-right" scope="col">Income</th>
                </tr>
              </thead>
              <tbody>
                {stateRecords.map((r) => (
                  <tr key={r.id} className="border-b border-border-default">
                    <td className="py-2 pr-4">{new Date(r.performance_date).toLocaleDateString()}</td>
                    <td className="py-2 pr-4 font-medium">{r.state}</td>
                    <td className="py-2 pr-4 text-text-secondary">{r.city || '—'}</td>
                    <td className="py-2 pr-4 text-text-secondary">{r.venue_name || '—'}</td>
                    <td className="py-2 text-right font-medium">{fmt(Number(r.gross_income))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
