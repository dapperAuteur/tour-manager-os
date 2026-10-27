import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Music2 } from 'lucide-react'
import { getShow } from '@/lib/tours/queries'
import { getFestivalContext } from '@/lib/festival/queries'
import { FestivalLineup } from './festival-lineup'

export const metadata: Metadata = {
  title: 'Festival Lineup',
  robots: { index: false },
}

export default async function FestivalPage({
  params,
}: {
  params: Promise<{ id: string; showId: string }>
}) {
  const { id: tourId, showId } = await params
  let show
  try {
    show = await getShow(showId)
  } catch {
    notFound()
  }
  if (!show) notFound()

  const ctx = await getFestivalContext(showId, tourId, show.venue_name)

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href={`/tours/${tourId}/shows/${showId}`}
        className="mb-3 inline-block text-sm text-text-muted hover:text-text-secondary"
      >
        &larr; Back to show
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Music2 className="size-5" aria-hidden /> Festival Lineup
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          For multi-act shows: assign each act to a stage with a start
          time. Single-headliner shows can skip this — the regular show
          page covers them.
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {show.venue_name || show.city} &middot;{' '}
          {new Date(show.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          {show.timezone && (
            <span className="ml-1">({show.timezone})</span>
          )}
        </p>
      </header>

      <FestivalLineup
        tourId={tourId}
        showId={showId}
        slots={ctx.slots}
        stages={ctx.stages}
        acts={ctx.acts}
      />
    </main>
  )
}
