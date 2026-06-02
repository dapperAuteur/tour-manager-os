import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { listMapVenues } from '@/lib/venues/map-queries'
import { VenueMapLoader } from './venue-map-loader'

export const metadata: Metadata = {
  title: 'Venue Map',
  robots: { index: false },
}

export default async function VenueMapPage() {
  const venues = await listMapVenues()

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/venues"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Back to venue directory
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <MapPin className="size-5" aria-hidden /> Venue Map
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Every venue in the shared directory with known coordinates.
          Routing a tour, scouting an off-day side gig, or eyeballing
          density in a region — start here. Venues without coordinates
          are listed on{' '}
          <Link href="/venues" className="underline">the directory</Link>{' '}
          and surface here once an advance sheet adds an address.
        </p>
        <p className="mt-2 text-xs text-text-muted">
          {venues.length.toLocaleString()} venue
          {venues.length === 1 ? '' : 's'} mapped
        </p>
      </header>

      {venues.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-10 text-center">
          <p className="text-sm text-text-secondary">
            No venues have coordinates yet. As advance sheets come in,
            the geocoder will start filling this map.
          </p>
        </div>
      ) : (
        <VenueMapLoader venues={venues} />
      )}
    </main>
  )
}
