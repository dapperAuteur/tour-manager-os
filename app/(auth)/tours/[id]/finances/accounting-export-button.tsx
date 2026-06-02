'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'

export function AccountingExportButton({ tourId }: { tourId: string }) {
  const [open, setOpen] = useState(false)

  function download(format: 'quickbooks' | 'xero') {
    const url = `/api/finances/accounting-export?tour_id=${tourId}&format=${format}`
    window.location.href = url
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm font-medium hover:bg-surface-alt"
      >
        <BookOpen className="size-4" aria-hidden /> Export for accounting
        <ChevronDown className="size-3" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-56 rounded-md border border-border-default bg-surface-raised p-1 shadow"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => download('quickbooks')}
            className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-surface-alt"
          >
            QuickBooks Online (CSV)
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => download('xero')}
            className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-surface-alt"
          >
            Xero (CSV)
          </button>
        </div>
      )}
    </div>
  )
}
