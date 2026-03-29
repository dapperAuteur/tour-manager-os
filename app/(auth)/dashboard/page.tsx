import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, MapPin, Calendar, Users } from 'lucide-react'
import { getTours } from '@/lib/tours/queries'

export const metadata: Metadata = {
  title: 'Dashboard',
}

const statusColors: Record<string, string> = {
  draft: 'bg-text-muted/20 text-text-muted',
  active: 'bg-success-500/20 text-success-600 dark:text-success-500',
  completed: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  cancelled: 'bg-error-500/20 text-error-600 dark:text-error-500',
}

export default async function DashboardPage() {
  const tours = await getTours()

  return (
    <>
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Tours</h1>
          <Link
            href="/tours/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Tour
          </Link>
        </div>

        {tours.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface-raised p-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-text-muted" aria-hidden="true" />
            <h2 className="mb-2 text-lg font-semibold">No tours yet</h2>
            <p className="mb-6 text-sm text-text-secondary">
              Create your first tour to start managing shows and itineraries.
            </p>
            <Link
              href="/tours/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Your First Tour
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.id}`}
                className="group rounded-xl border border-border-default bg-surface-raised p-5 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface dark:hover:shadow-lg dark:hover:shadow-black/20"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {tour.name}
                    </h2>
                    <p className="text-sm text-text-secondary">{tour.artist_name}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[tour.status] || statusColors.draft}`}>
                    {tour.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-muted">
                  {tour.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {new Date(tour.start_date).toLocaleDateString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {Array.isArray(tour.shows) ? tour.shows.length : 0} shows
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" aria-hidden="true" />
                    {Array.isArray(tour.tour_members) ? tour.tour_members.length : 0} members
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
