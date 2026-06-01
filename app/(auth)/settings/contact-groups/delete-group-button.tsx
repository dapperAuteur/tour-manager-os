'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteContactGroup } from '@/lib/venues/contact-group-actions'

export function DeleteGroupButton({
  groupId,
  name,
}: {
  groupId: string
  name: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)

  async function onClick() {
    if (
      !window.confirm(
        `Delete group "${name}"? Contacts in the group will remain visible to everyone.`,
      )
    ) {
      return
    }
    setBusy(true)
    const result = await deleteContactGroup(groupId)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center rounded-md border border-error-500/40 px-2 py-1 text-xs font-medium text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
      aria-label={`Delete group ${name}`}
    >
      <Trash2 className="size-3" aria-hidden />
    </button>
  )
}
