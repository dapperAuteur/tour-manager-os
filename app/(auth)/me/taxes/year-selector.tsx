'use client'

import { useRouter } from 'next/navigation'

export function YearSelector({ currentYear }: { currentYear: number }) {
  const router = useRouter()
  const thisYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => thisYear - i)

  return (
    <div>
      <label htmlFor="tax-year" className="sr-only">Tax year</label>
      <select
        id="tax-year"
        value={currentYear}
        onChange={(e) => router.push(`/me/taxes?year=${e.target.value}`)}
        className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}
