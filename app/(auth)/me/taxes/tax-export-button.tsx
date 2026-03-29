'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { generateTaxExportCsv } from '@/lib/taxes/actions'

export function TaxExportButton({ userId, taxYear }: { userId: string; taxYear: number }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    const csv = await generateTaxExportCsv(userId, taxYear)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tax-summary-${taxYear}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={`Export ${taxYear} tax summary as CSV`}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {loading ? 'Exporting...' : 'Export CSV'}
    </button>
  )
}
