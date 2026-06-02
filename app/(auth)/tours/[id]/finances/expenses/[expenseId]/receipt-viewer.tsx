'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ExternalLink, X } from 'lucide-react'

/**
 * Renders the receipt image (or PDF fallback) attached to an expense.
 * Click-to-open lightbox for images; opens the PDF in a new tab.
 *
 * Cloudinary delivers any uploaded format at the resolution we ask for
 * — the thumbnail transform keeps the page light, the lightbox shows
 * the full-resolution asset for review.
 */
function isPdf(url: string): boolean {
  return /\.pdf($|\?)/i.test(url)
}

function withTransform(url: string, transform: string): string {
  // Cloudinary URLs let you inject a transform between /upload/ and the
  // public id. Skip transformation for non-Cloudinary URLs.
  if (!url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transform}/`)
}

export function ReceiptViewer({ url }: { url: string }) {
  const [open, setOpen] = useState(false)
  if (isPdf(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface px-3 py-2 text-sm hover:bg-surface-alt"
      >
        Open PDF receipt <ExternalLink className="size-3.5" aria-hidden />
      </a>
    )
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block aspect-[3/4] w-40 overflow-hidden rounded-md border border-border-default bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Open full-size receipt"
      >
        <Image
          src={withTransform(url, 'f_auto,q_auto,w_400,c_limit')}
          alt="Receipt"
          fill
          sizes="(min-width: 768px) 10rem, 50vw"
          className="object-cover"
          unoptimized
        />
      </button>
      <p className="mt-2 text-xs text-text-muted">
        Click to view full size.
      </p>
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          aria-label="Close receipt viewer"
        >
          <X className="absolute right-4 top-4 size-6 text-white" aria-hidden />
          <Image
            src={withTransform(url, 'f_auto,q_auto,w_1600,c_limit')}
            alt="Receipt full size"
            width={1600}
            height={2400}
            className="max-h-full max-w-full object-contain"
            unoptimized
          />
        </button>
      )}
    </>
  )
}
