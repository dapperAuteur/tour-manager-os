'use client'

import { Download } from 'lucide-react'
import { generateTemplateCsv, type CsvTemplate } from '@/lib/csv/templates'

export function TemplateDownloadButton({ template }: { template: CsvTemplate }) {
  function handleDownload() {
    const csv = generateTemplateCsv(template)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = template.filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-1 rounded-lg border border-border-default px-2 py-1 text-xs font-medium transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={`Download ${template.name} CSV template`}
    >
      <Download className="h-3 w-3" aria-hidden="true" /> Template
    </button>
  )
}
