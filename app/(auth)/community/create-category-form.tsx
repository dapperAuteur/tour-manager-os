'use client'

import { useState } from 'react'
import { createCategory } from '@/lib/community/actions'

export function CreateCategoryForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createCategory(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
    else setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex gap-3">
      {error && <div role="alert" className="text-sm text-error-500">{error}</div>}
      <div className="flex-1">
        <label htmlFor="cat-name" className="sr-only">Category name</label>
        <input id="cat-name" name="name" type="text" required placeholder="Category name" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>
      <div className="flex-1">
        <label htmlFor="cat-desc" className="sr-only">Description</label>
        <input id="cat-desc" name="description" type="text" placeholder="Description (optional)" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>
      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
        {loading ? '...' : 'Add'}
      </button>
    </form>
  )
}
