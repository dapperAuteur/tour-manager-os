'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { deleteTicketType } from '@/lib/tickets/actions'

interface DeleteTicketTypeButtonProps {
  tourId: string
  showId: string
  ticketTypeId: string
  name: string
  hasSold: boolean
}

export function DeleteTicketTypeButton({
  tourId,
  showId,
  ticketTypeId,
  name,
  hasSold,
}: DeleteTicketTypeButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    if (hasSold) {
      const ok = window.confirm(
        `${name} already has issued tickets. Deleting it would orphan those QR codes. Click Cancel to keep it; use Edit → uncheck "Visible on the public buy page" to hide it instead.`,
      )
      if (!ok) return
    } else {
      const ok = window.confirm(`Delete ticket type "${name}"?`)
      if (!ok) return
    }
    setError(null)
    setDeleting(true)
    const result = await deleteTicketType(tourId, showId, ticketTypeId)
    setDeleting(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={deleting}
        className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
        aria-label={`Delete ticket type ${name}`}
      >
        {deleting ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-3" aria-hidden />
        )}{' '}
        Delete
      </button>
      {error && (
        <span className="ml-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </>
  )
}
