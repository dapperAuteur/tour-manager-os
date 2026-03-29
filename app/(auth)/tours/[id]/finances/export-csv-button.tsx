'use client'

import { Download } from 'lucide-react'

interface Expense {
  id: string
  date: string
  category: string
  amount: number | string
  description: string | null
  status: string
  is_tax_deductible: boolean | null
}

export function ExportCsvButton({ expenses }: { expenses: Expense[] }) {
  function handleExport() {
    if (expenses.length === 0) return

    const headers = ['Date', 'Category', 'Amount', 'Description', 'Status', 'Tax Deductible']
    const rows = expenses.map((e) => [
      e.date,
      e.category,
      String(e.amount),
      e.description || '',
      e.status,
      e.is_tax_deductible ? 'Yes' : 'No',
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={expenses.length === 0}
      className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label="Export expenses as CSV"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Export CSV
    </button>
  )
}
