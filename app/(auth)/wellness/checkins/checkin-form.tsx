'use client'

import { useState } from 'react'
import { createCheckin } from '@/lib/wellness/actions'

export function CheckinForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSuccess(false)
    setLoading(true)
    const result = await createCheckin(orgId, formData)
    if (result?.error) setError(result.error)
    else { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex gap-3">
      {error && <div role="alert" className="text-sm text-error-500">{error}</div>}
      {success && <div role="status" className="text-sm text-success-600 dark:text-success-500">Check-in sent!</div>}
      <label htmlFor="prompt" className="sr-only">Check-in prompt</label>
      <input id="prompt" name="prompt" type="text" required placeholder="How is everyone feeling about the tour?" className="flex-1 rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? '...' : 'Send'}</button>
    </form>
  )
}
