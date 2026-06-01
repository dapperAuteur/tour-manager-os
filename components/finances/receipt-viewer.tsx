'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, FileText, X } from 'lucide-react'

/**
 * Lightweight viewer for expense receipt images. Renders a thumbnail
 * button that opens a modal with the full image. Falls back to an
 * external link if the URL doesn't look like an image (e.g. a PDF).
 */
export function ReceiptViewer({
  url,
  alt,
}: {
  url: string
  alt: string
}) {
  const [open, setOpen] = useState(false)

  const isImage = /\.(jpe?g|png|webp|gif|heic|heif)(\?|$)/i.test(url)

  if (!isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-md border border-border-default px-2 py-0.5 text-[10px] font-medium hover:bg-surface-alt"
        title="Open receipt in a new tab"
      >
        <FileText className="size-3" aria-hidden /> File
        <ExternalLink className="size-2.5" aria-hidden />
      </a>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View receipt for ${alt}`}
        className="relative size-8 overflow-hidden rounded-md border border-border-default hover:ring-2 hover:ring-primary-500"
      >
        <Image
          src={url}
          alt=""
          fill
          sizes="32px"
          className="object-cover"
          unoptimized
        />
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Receipt for ${alt}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close receipt viewer"
              className="absolute -top-3 -right-3 rounded-full bg-surface-raised p-1.5 shadow hover:bg-surface-alt"
            >
              <X className="size-4" aria-hidden />
            </button>
            <Image
              src={url}
              alt={alt}
              width={1200}
              height={1600}
              className="max-h-[90vh] w-auto rounded-md bg-surface object-contain"
              unoptimized
            />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-surface-raised/90 px-2 py-1 text-[10px] font-medium hover:bg-surface"
            >
              Open original <ExternalLink className="size-2.5" aria-hidden />
            </a>
          </div>
        </div>
      )}
    </>
  )
}
