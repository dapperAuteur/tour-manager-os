'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { deleteLesson, upsertLesson } from '@/lib/academy/admin-actions'

interface Lesson {
  id: string
  title: string
  slug: string
  content: string
  video_url: string | null
  sort_order: number
  published: boolean
}

export function LessonsEditor({
  courseId,
  initial,
}: {
  courseId: string
  initial: Lesson[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function save(formData: FormData, lessonId?: string) {
    setBusy(true)
    setError(null)
    const result = await upsertLesson(formData, lessonId)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setEditingId(null)
    setAdding(false)
    startTransition(() => router.refresh())
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this lesson?')) return
    setBusy(true)
    const result = await deleteLesson(id)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}

      {initial.length === 0 && !adding ? (
        <p className="text-sm text-text-secondary">No lessons yet.</p>
      ) : (
        <ul className="space-y-2">
          {initial.map((lesson) => (
            <li
              key={lesson.id}
              className={`rounded-md border border-border-default p-3 ${
                lesson.published ? 'bg-surface' : 'bg-surface opacity-70'
              }`}
            >
              {editingId === lesson.id ? (
                <LessonForm
                  courseId={courseId}
                  initial={lesson}
                  busy={busy}
                  onCancel={() => setEditingId(null)}
                  onSave={(fd) => save(fd, lesson.id)}
                />
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      <span className="text-xs text-text-muted">
                        #{lesson.sort_order}
                      </span>
                      {lesson.title}
                      {!lesson.published && (
                        <span className="rounded-full bg-text-muted/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                          Draft
                        </span>
                      )}
                      {lesson.video_url && (
                        <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                          Video
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      slug <code className="font-mono">{lesson.slug}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(lesson.id)}
                      aria-label="Edit"
                      className="rounded p-1 text-text-muted hover:bg-surface-alt"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(lesson.id)}
                      disabled={busy}
                      aria-label="Delete"
                      className="rounded p-1 text-error-600 hover:bg-error-500/10 dark:text-error-400"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="rounded-md border border-primary-500/30 bg-primary-500/5 p-3">
          <LessonForm
            courseId={courseId}
            busy={busy}
            onCancel={() => setAdding(false)}
            onSave={(fd) => save(fd)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 dark:text-primary-300"
        >
          <Plus className="size-3" aria-hidden /> Add lesson
        </button>
      )}
    </div>
  )
}

function LessonForm({
  courseId,
  initial,
  busy,
  onCancel,
  onSave,
}: {
  courseId: string
  initial?: Lesson
  busy: boolean
  onCancel: () => void
  onSave: (formData: FormData) => void
}) {
  return (
    <form
      action={onSave}
      className="space-y-3"
    >
      <input type="hidden" name="course_id" value={courseId} />
      <div className="grid gap-2 sm:grid-cols-2">
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
            Slug (blank to auto)
          </span>
          <input
            type="text"
            name="slug"
            defaultValue={initial?.slug || ''}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm font-mono"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">
          Body (markdown supported)
        </span>
        <textarea
          name="content"
          required
          rows={6}
          defaultValue={initial?.content || ''}
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm font-mono"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Video URL (optional)</span>
        <input
          type="url"
          name="video_url"
          defaultValue={initial?.video_url || ''}
          placeholder="https://www.youtube.com/watch?v=… or https://vimeo.com/…"
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        />
      </label>
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
          Published
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : initial ? 'Save lesson' : 'Create lesson'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-1.5 text-xs font-medium hover:bg-surface-alt"
        >
          <X className="size-3" aria-hidden /> Cancel
        </button>
      </div>
    </form>
  )
}
