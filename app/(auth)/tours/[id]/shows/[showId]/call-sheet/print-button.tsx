'use client'

import { Printer } from 'lucide-react'

export function PrintButtonClient() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
    >
      <Printer className="size-3" aria-hidden /> Print or PDF
    </button>
  )
}
