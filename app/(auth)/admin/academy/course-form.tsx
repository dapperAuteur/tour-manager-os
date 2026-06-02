'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertCourse, deleteCourse } from '@/lib/academy/admin-actions'

interface CourseRow {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_minutes: number | null
  sort_order: number
  published: boolean
}

export function CourseForm({ initial }: { initial?: CourseRow }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function action(formData: FormData) {
    setBusy(true)
    setError(null)
    const result = await upsertCourse(formData, initial?.id)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    if (!initial && result.id) {
      router.push(`/admin/academy/courses/${result.id}`)
      return
    }
    startTransition(() => router.refresh())
  }

  async function remove() {
    if (!initial) return
    if (
      !window.confirm(
        `Delete "${initial.title}" and every lesson + quiz inside it?`,
      )
    )
      return
    setBusy(true)
    const result = await deleteCourse(initial.id)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    router.push('/admin/academy')
  }

  return (
    <form action={action} className="space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-md border border-error-500/30 bg-error-500/10 p-2 text-sm text-error-700 dark:text-error-400"
        >
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Title</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={initial?.title || ''}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">
            Slug (leave blank to auto)
          </span>
          <input
            type="text"
            name="slug"
            defaultValue={initial?.slug || ''}
            placeholder="show-day-basics"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm font-mono"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium">Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={initial?.description || ''}
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Category</span>
          <input
            type="text"
            name="category"
            required
            defaultValue={initial?.category || ''}
            placeholder="show-day · finances · merch"
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Difficulty</span>
          <select
            name="difficulty"
            defaultValue={initial?.difficulty || 'beginner'}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Estimated minutes</span>
          <input
            type="number"
            name="estimated_minutes"
            min="1"
            defaultValue={initial?.estimated_minutes ?? ''}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Sort order</span>
          <input
            type="number"
            name="sort_order"
            defaultValue={initial?.sort_order ?? 0}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={initial?.published ?? true}
            className="rounded accent-primary-600"
          />
          Published (visible on /academy)
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Create course'}
        </button>
        {initial && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-md border border-error-500/40 px-3 py-1.5 text-sm font-medium text-error-700 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
          >
            Delete course
          </button>
        )}
      </div>
    </form>
  )
}
