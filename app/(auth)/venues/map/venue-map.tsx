'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import Link from 'next/link'

// Lucide default markers shipped with leaflet point at /marker-icon.png in
// the package, which Next's bundler doesn't expose. We rebuild the icon
// inline as an SVG data URL so we don't have to copy assets into /public.
const markerSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 36' width='24' height='36'>
    <path fill='#0f766e' stroke='#fff' stroke-width='1.5' d='M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z'/>
    <circle fill='#fff' cx='12' cy='12' r='4.5'/>
  </svg>`,
)

const venueIcon = L.icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${markerSvg}`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -32],
})

export interface MapVenue {
  id: string
  name: string
  city: string
  state: string | null
  country: string | null
  venue_type: string | null
  capacity: number | null
  lat: number
  lng: number
  times_played: number
}

function FitBounds({ venues }: { venues: MapVenue[] }) {
  const map = useMap()
  useEffect(() => {
    if (venues.length === 0) return
    const bounds = L.latLngBounds(venues.map((v) => [v.lat, v.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 })
  }, [map, venues])
  return null
}

export function VenueMap({ venues }: { venues: MapVenue[] }) {
  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-xl border border-border-default">
      <MapContainer
        center={[39, -98]} // CONUS centroid as a sensible default
        zoom={4}
        scrollWheelZoom
        className="size-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds venues={venues} />
        {venues.map((v) => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={venueIcon}>
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{v.name}</p>
                <p className="text-text-muted">
                  {v.city}
                  {v.state ? `, ${v.state}` : ''}
                  {v.country && v.country !== 'US' ? `, ${v.country}` : ''}
                </p>
                {v.capacity && (
                  <p className="text-xs">Capacity: {v.capacity.toLocaleString()}</p>
                )}
                {v.times_played > 0 && (
                  <p className="text-xs">
                    {v.times_played} show{v.times_played === 1 ? '' : 's'} played
                  </p>
                )}
                <Link
                  href={`/venues/${v.id}`}
                  className="inline-block pt-1 font-medium text-primary-700 hover:underline"
                >
                  Open profile &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
