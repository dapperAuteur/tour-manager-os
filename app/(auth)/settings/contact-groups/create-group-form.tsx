'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createContactGroup } from '@/lib/venues/contact-group-actions'

export function CreateGroupForm() {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function action(formData: FormData) {
    setError(null)
    setSubmitting(true)
    const result = await createContactGroup(formData)
    setSubmitting(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    if (result.id) {
      startTransition(() => {
        router.push(`/settings/contact-groups/${result.id}`)
      })
    }
  }

  return (
    <form action={action} className="space-y-3">
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">{error}</p>
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Group name</span>
        <input
          type="text"
          name="name"
          required
          maxLength={80}
          placeholder="e.g. Bookers, Trusted production leads"
          className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Description (optional)</span>
        <input
          type="text"
          name="description"
          maxLength={200}
          placeholder="What this group is for"
          className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create group'}
      </button>
    </form>
  )
}
