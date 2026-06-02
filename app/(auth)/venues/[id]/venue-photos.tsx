'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react'

export interface VenuePhoto {
  url: string
  public_id: string
  caption?: string | null
  uploaded_by?: string
  uploaded_at?: string
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif'

export function VenuePhotos({
  venueId,
  initial,
}: {
  venueId: string
  initial: VenuePhoto[]
}) {
  const router = useRouter()
  const [photos, setPhotos] = useState<VenuePhoto[]>(initial)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // reset for repeat uploads
    if (!file) return
    setError(null)
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(`/api/venues/${venueId}/photos`, {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Upload failed')
      } else {
        setPhotos(json.photos)
        startTransition(() => router.refresh())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function remove(publicId: string) {
    if (!window.confirm('Delete this photo?')) return
    setError(null)
    try {
      const res = await fetch(
        `/api/venues/${venueId}/photos?public_id=${encodeURIComponent(publicId)}`,
        { method: 'DELETE' },
      )
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Delete failed')
      } else {
        setPhotos(json.photos)
        startTransition(() => router.refresh())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-6 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Photos ({photos.length})
        </h2>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary-500/40 bg-primary-500/5 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-500/10 disabled:opacity-50 dark:text-primary-300"
        >
          {uploading ? (
            <>
              <Loader2 className="size-3 animate-spin" aria-hidden /> Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="size-3" aria-hidden /> Add photo
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onPick}
          className="hidden"
        />
      </div>

      {error && (
        <p role="alert" className="mb-3 text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}

      {photos.length === 0 ? (
        <p className="text-sm text-text-muted">
          No photos yet. The first band to upload helps everyone else who
          plays here — load-in shots, the stage, the green room, parking,
          the marquee.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p, i) => (
            <li key={p.public_id || p.url} className="group relative">
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className="relative block aspect-square w-full overflow-hidden rounded-md border border-border-default bg-surface focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={p.caption ? `Open photo: ${p.caption}` : 'Open photo'}
              >
                <Image
                  src={p.url}
                  alt={p.caption || 'Venue photo'}
                  fill
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition group-hover:scale-105"
                  unoptimized
                />
              </button>
              {p.public_id && (
                <button
                  type="button"
                  onClick={() => remove(p.public_id)}
                  aria-label="Delete photo"
                  className="absolute right-1 top-1 rounded bg-error-600/90 p-1 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="size-3" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {activeIndex != null && photos[activeIndex] && (
        <button
          type="button"
          onClick={() => setActiveIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          aria-label="Close photo viewer"
        >
          <X className="absolute right-4 top-4 size-6 text-white" aria-hidden />
          <Image
            src={photos[activeIndex].url}
            alt={photos[activeIndex].caption || 'Venue photo'}
            width={1600}
            height={1200}
            className="max-h-full max-w-full object-contain"
            unoptimized
          />
        </button>
      )}
    </div>
  )
}
