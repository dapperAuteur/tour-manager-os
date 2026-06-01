import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Coffee } from 'lucide-react'
import {
  listOffDaysForTour,
  suggestionLinks,
} from '@/lib/days-off/queries'
import { DayOffSlots } from './day-off-slots'

export const metadata: Metadata = {
  title: 'Days Off',
  robots: { index: false },
}

export default async function DaysOffPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: tourId } = await params
  const slots = await listOffDaysForTour(tourId)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href={`/tours/${tourId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Back to tour
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Coffee className="size-5" aria-hidden /> Days Off
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Every day between the first and last show without a gig. Plan
          intentional rest, sightseeing, gym sessions, family time, or
          errand windows — burnout shows up fastest on tours with no off-day
          plans.
        </p>
      </header>

      {slots.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-10 text-center">
          <Calendar className="mx-auto mb-3 size-8 text-text-muted" aria-hidden />
          <p className="text-sm text-text-secondary">
            No off-days in this tour&apos;s schedule (yet). Add a tour
            start/end date and at least one show to see open days here.
          </p>
        </div>
      ) : (
        <DayOffSlots
          tourId={tourId}
          slots={slots.map((s) => ({
            ...s,
            suggestions: suggestionLinks(s.city, s.state),
          }))}
        />
      )}
    </main>
  )
}
