'use client'

import { useState } from 'react'
import { createReply } from '@/lib/community/actions'

export function ReplyForm({ postId, categorySlug }: { postId: string; categorySlug: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createReply(postId, categorySlug, formData)
    if (result?.error) { setError(result.error) }
    else { setContent('') }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      {error && <div role="alert" className="text-sm text-error-500">{error}</div>}
      <label htmlFor="reply-content" className="sr-only">Reply</label>
      <textarea
        id="reply-content"
        name="content"
        rows={3}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        placeholder="Write a reply..."
      />
      <button type="submit" disabled={loading || !content.trim()} className="self-end rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
        {loading ? 'Posting...' : 'Reply'}
      </button>
    </form>
  )
}
