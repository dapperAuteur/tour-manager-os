'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { MapVenue } from './venue-map'

// Leaflet uses window globals at import time, so the map module must
// load client-only. Wrapping it in a thin client component lets the
// surrounding page stay a server component.
const VenueMap = dynamic(() => import('./venue-map').then((m) => m.VenueMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-xl border border-border-default bg-surface-raised">
      <Loader2 className="size-6 animate-spin text-text-muted" aria-hidden />
    </div>
  ),
})

export function VenueMapLoader({ venues }: { venues: MapVenue[] }) {
  return <VenueMap venues={venues} />
}
