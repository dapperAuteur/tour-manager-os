'use client'

import { useState } from 'react'
import { createBlogPost } from '@/lib/blog/actions'

export function NewBlogForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createBlogPost(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">Title <span className="text-error-500">*</span></label>
        <input id="title" name="title" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Post title" />
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium">Content <span className="text-error-500">*</span></label>
        <textarea id="content" name="content" rows={10} required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Write your post..." />
      </div>

      <div>
        <label htmlFor="excerpt" className="mb-1 block text-sm font-medium">Excerpt</label>
        <textarea id="excerpt" name="excerpt" rows={2} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Short summary for listings..." />
      </div>

      <div>
        <label htmlFor="cover_image_url" className="mb-1 block text-sm font-medium">Cover Image URL</label>
        <input id="cover_image_url" name="cover_image_url" type="url" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="https://..." />
      </div>

      <div>
        <label htmlFor="video_url" className="mb-1 block text-sm font-medium">Video URL</label>
        <input id="video_url" name="video_url" type="url" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="https://..." />
      </div>

      <div>
        <label htmlFor="audio_url" className="mb-1 block text-sm font-medium">Audio URL</label>
        <input id="audio_url" name="audio_url" type="url" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="https://..." />
      </div>

      <div>
        <label htmlFor="tags" className="mb-1 block text-sm font-medium">Tags (comma-separated)</label>
        <input id="tags" name="tags" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="tour, behind-the-scenes, music" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" className="rounded accent-primary-600" />
        Publish immediately
      </label>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Post'}</button>
    </form>
  )
}
