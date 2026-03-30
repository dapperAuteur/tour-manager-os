'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, Copy } from 'lucide-react'
import { deleteRecord, duplicateRecord } from '@/lib/crud/actions'

interface RecordActionsProps {
  table: string
  id: string
  editHref?: string
  revalidatePath: string
  duplicateRedirectPrefix?: string
  onDelete?: () => void
  compact?: boolean
}

export function RecordActions({ table, id, editHref, revalidatePath: revalidate, duplicateRedirectPrefix, onDelete, compact }: RecordActionsProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this record? This cannot be undone.')) return
    setLoading(true)
    const result = await deleteRecord(table as Parameters<typeof deleteRecord>[0], id, revalidate)
    if (result.error) { alert(result.error); setLoading(false); return }
    onDelete?.()
    setLoading(false)
    setOpen(false)
  }

  async function handleDuplicate() {
    setLoading(true)
    const result = await duplicateRecord(table as Parameters<typeof duplicateRecord>[0], id, undefined, revalidate)
    if (result.error) { alert(result.error); setLoading(false); return }
    if (duplicateRedirectPrefix && result.newId) {
      router.push(`${duplicateRedirectPrefix}/${result.newId}`)
    }
    setLoading(false)
    setOpen(false)
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {editHref && (
          <a href={editHref} className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-text-primary" aria-label="Edit">
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
        <button type="button" onClick={handleDuplicate} disabled={loading} className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-text-primary" aria-label="Duplicate">
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button type="button" onClick={handleDelete} disabled={loading} className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-error-500" aria-label="Delete">
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Actions"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-border-default bg-surface-raised py-1 shadow-lg" role="menu">
            {editHref && (
              <a href={editHref} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-alt" role="menuitem">
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
              </a>
            )}
            <button type="button" onClick={handleDuplicate} disabled={loading} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-alt disabled:opacity-50" role="menuitem">
              <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Duplicate
            </button>
            <button type="button" onClick={handleDelete} disabled={loading} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error-500 hover:bg-surface-alt disabled:opacity-50" role="menuitem">
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
