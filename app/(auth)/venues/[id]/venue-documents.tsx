'use client'

import { useRef, useState } from 'react'
import {
  FileText,
  Lightbulb,
  Trash2,
  Upload,
  Video,
  Volume2,
} from 'lucide-react'

export interface VenueDocument {
  id: string
  kind: string
  title: string
  file_url: string
  public_id: string | null
  content_type: string | null
  bytes: number | null
  created_at?: string
}

const KIND_OPTIONS: { value: string; label: string }[] = [
  { value: 'sound', label: 'Sound' },
  { value: 'lights', label: 'Lights' },
  { value: 'video', label: 'Video' },
  { value: 'stage_plot', label: 'Stage plot' },
  { value: 'other', label: 'Other' },
]
const KIND_LABELS = Object.fromEntries(
  KIND_OPTIONS.map((k) => [k.value, k.label]),
) as Record<string, string>

function kindIcon(kind: string) {
  if (kind === 'sound') return Volume2
  if (kind === 'lights') return Lightbulb
  if (kind === 'video') return Video
  return FileText
}

function fmtBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function VenueDocuments({
  venueId,
  initial,
}: {
  venueId: string
  initial: VenueDocument[]
}) {
  const [docs, setDocs] = useState<VenueDocument[]>(initial)
  const [kind, setKind] = useState('sound')
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('kind', kind)
      form.append('title', title)
      const res = await fetch(`/api/venues/${venueId}/documents`, {
        method: 'POST',
        body: form,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Upload failed.')
        return
      }
      setDocs((prev) => [data.document as VenueDocument, ...prev])
      setTitle('')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(doc: VenueDocument) {
    if (!window.confirm(`Delete "${doc.title}"?`)) return
    const res = await fetch(
      `/api/venues/${venueId}/documents?id=${encodeURIComponent(doc.id)}`,
      { method: 'DELETE' },
    )
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      window.alert(data?.error || 'Delete failed.')
      return
    }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id))
  }

  return (
    <section
      aria-label="Venue tech documents"
      className="rounded-xl border border-border-default bg-surface-raised p-5 lg:col-span-2"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Tech Docs (sound, lights, video)
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            aria-label="Document type"
            className="rounded-md border border-border-default bg-surface px-2 py-1.5 text-xs"
          >
            {KIND_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            maxLength={120}
            className="w-40 rounded-md border border-border-default bg-surface px-2 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1 rounded-md border border-primary-500/40 bg-primary-500/5 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 disabled:opacity-50 dark:text-primary-300"
          >
            <Upload className="size-3" aria-hidden />
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md,.csv,image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-3 rounded-md bg-error-500/10 p-2 text-xs text-error-600 dark:text-error-500"
        >
          {error}
        </div>
      )}

      {docs.length === 0 ? (
        <p className="text-sm text-text-muted">
          No tech docs yet. Upload the venue&apos;s sound, lights, or
          video specs as a PDF or text file so the whole team can find
          them before load-in.
        </p>
      ) : (
        <ul className="space-y-2">
          {docs.map((doc) => {
            const Icon = kindIcon(doc.kind)
            return (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border-default bg-surface p-3"
              >
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 hover:underline"
                >
                  <Icon
                    className="size-4 shrink-0 text-primary-600 dark:text-primary-400"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {doc.title}
                    </span>
                    <span className="block text-xs text-text-muted">
                      {KIND_LABELS[doc.kind] || doc.kind}
                      {doc.bytes ? ` · ${fmtBytes(doc.bytes)}` : ''}
                    </span>
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  className="inline-flex items-center rounded p-1 text-error-600 hover:bg-error-500/10 dark:text-error-400"
                  aria-label={`Delete ${doc.title}`}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
