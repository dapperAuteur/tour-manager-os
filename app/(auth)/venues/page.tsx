import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Users } from 'lucide-react'
import { searchVenues } from '@/lib/venues/queries'
import { SearchBar } from '@/components/ui/search-bar'

export const metadata: Metadata = { title: 'Venue Network', robots: { index: false } }

const typeLabels: Record<string, string> = {
  club: 'Club', theater: 'Theater', festival: 'Festival', outdoor: 'Outdoor', arena: 'Arena', other: 'Other',
}

export default async function VenuesPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q, type } = await searchParams
  const venues = await searchVenues(q, type)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Venue Network</h1>
        <p className="mt-1 text-sm text-text-secondary">Browse venues from advance sheets across the platform. Data grows as more shows are played.</p>
      </div>

      <SearchBar basePath="/venues" placeholder="Search venues by name or city..." initialQuery={q} />

      {/* Type filter */}
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by venue type">
        <Link
          href="/venues"
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${!type ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-border-default hover:bg-surface-alt'}`}
        >
          All
        </Link>
        {Object.entries(typeLabels).map(([value, label]) => (
          <Link
            key={value}
            href={`/venues?type=${value}${q ? `&q=${q}` : ''}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${type === value ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-border-default hover:bg-surface-alt'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {venues.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">
            {q ? `No venues matching "${q}".` : 'No venues in the network yet. Venues are added automatically from advance sheets.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-4 transition-all hover:border-primary-500/50 hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt">
                  <MapPin className="h-5 w-5 text-text-muted" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-medium">{venue.name}</h2>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
                    <span>{venue.city}{venue.state ? `, ${venue.state}` : ''}</span>
                    {venue.venue_type && <span className="capitalize">{venue.venue_type}</span>}
                    {venue.capacity && <span>{venue.capacity.toLocaleString()} cap</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Users className="h-3 w-3" aria-hidden="true" />
                {venue.times_played} show{venue.times_played !== 1 ? 's' : ''}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
