import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ScanLine } from 'lucide-react'
import { getShow } from '@/lib/tours/queries'
import { ScannerClient } from './scanner-client'

export const metadata: Metadata = {
  title: 'Door Scanner',
}

interface PageProps {
  params: Promise<{ id: string; showId: string }>
}

export default async function ScannerPage({ params }: PageProps) {
  const { id: tourId, showId } = await params
  const show = await getShow(showId)

  const venue =
    show.venue_name ||
    `${show.city}${show.state ? ', ' + show.state : ''}`

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href={`/tours/${tourId}/shows/${showId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden /> Back to Show
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-text-muted">
            <ScanLine className="size-4" aria-hidden />
            Door Scanner
          </div>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{venue}</h1>
          <p className="mt-1 text-sm text-text-muted">
            <time dateTime={show.date}>
              {new Date(show.date).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </p>
        </div>
      </div>

      <ScannerClient showId={showId} />
    </main>
  )
}
