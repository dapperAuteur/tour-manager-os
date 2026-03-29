'use client'

import { useState } from 'react'
import { createPost } from '@/lib/community/actions'

export function NewPostForm({ categoryId, categorySlug }: { categoryId: string; categorySlug: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createPost(categoryId, categorySlug, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">Title <span className="text-error-500">*</span></label>
        <input id="title" name="title" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="What's on your mind?" />
      </div>
      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium">Content <span className="text-error-500">*</span></label>
        <textarea id="content" name="content" rows={6} required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Share your thoughts..." />
      </div>
      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Posting...' : 'Post'}</button>
    </form>
  )
}
