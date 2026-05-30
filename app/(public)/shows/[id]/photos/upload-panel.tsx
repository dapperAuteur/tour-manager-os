'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ImagePlus, Loader2, X } from 'lucide-react'

interface UploadPanelProps {
  showId: string
  isAuthed: boolean
  canUpload: boolean
}

interface UploadedPhoto {
  id: string
  status: string
  url: string
}

export function UploadPanel({ showId, isAuthed, canUpload }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<UploadedPhoto | null>(null)

  if (!isAuthed) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
        <Link
          href={`/login?redirect=/shows/${showId}/photos`}
          className="font-medium text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
        >
          Sign in
        </Link>{' '}
        if you bought a ticket — ticket-holders can share photos here.
      </div>
    )
  }

  if (!canUpload) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
        Only ticket-holders can share photos from this show.{' '}
        <Link
          href={`/shows/${showId}/tickets`}
          className="font-medium text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
        >
          Get tickets
        </Link>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || submitting) return
    setError(null)
    setSubmitting(true)

    const form = new FormData()
    form.append('file', file)
    form.append('show_id', showId)
    if (caption.trim()) form.append('caption', caption.trim())

    try {
      const res = await fetch('/api/fan-photos', {
        method: 'POST',
        body: form,
      })
      const json = (await res.json().catch(() => ({}))) as {
        id?: string
        status?: string
        url?: string
        error?: string
      }
      if (!res.ok || !json.id) {
        setError(json.error || `upload failed (${res.status})`)
      } else {
        setSuccess({ id: json.id, status: json.status || 'pending', url: json.url || '' })
        setFile(null)
        setCaption('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'network error')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div
        role="status"
        className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm dark:border-green-900/50 dark:bg-green-950/30"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 size-5 text-green-600 dark:text-green-400"
            aria-hidden
          />
          <div className="flex-1">
            <p className="font-medium text-green-900 dark:text-green-100">
              In review
            </p>
            <p className="mt-1 text-green-800 dark:text-green-200">
              Your photo&apos;s with the tour team. You&apos;ll see it on the wall once approved.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="mt-2 text-xs font-medium text-green-800 underline dark:text-green-200"
            >
              Share another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-0">
          <span className="block text-sm font-medium">Share a photo</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white file:hover:bg-blue-700"
          />
          {file && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)}MB
            </p>
          )}
        </label>
        <label className="flex-1 min-w-0">
          <span className="block text-sm font-medium">Caption (optional)</span>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            placeholder="What was it like?"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
          />
        </label>
        <button
          type="submit"
          disabled={!file || submitting}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Uploading
            </>
          ) : (
            <>
              <ImagePlus className="size-4" aria-hidden /> Submit
            </>
          )}
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
        >
          <X className="mt-0.5 size-4" aria-hidden /> {error}
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Photos go to the tour team for review before appearing on the wall.
        Max 10MB. JPEG, PNG, WebP, or HEIC.
      </p>
    </form>
  )
}
