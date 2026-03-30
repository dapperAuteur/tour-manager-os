import Link from 'next/link'
import {
  MapPin, Phone, Clock, Hotel, Utensils, Volume2, Users, Navigation,
  Music, ArrowRight, Cigarette, Cloud, Thermometer, Droplets, Wind,
} from 'lucide-react'
import type { ShowDayData } from '@/lib/showday/queries'

interface WeatherData {
  temp_high_f: number
  temp_low_f: number
  description: string
  precipitation_pct: number
  wind_mph: number
}

function TimeBlock({ time, label, tz }: { time: string | null; label: string; tz: string }) {
  if (!time) return null
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-24 text-right text-sm font-semibold">{time} <span className="text-xs text-text-muted">{tz}</span></span>
      <div className="h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

function InfoCard({ title, icon: Icon, children }: {
  title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        <Icon className="h-4 w-4" aria-hidden="true" /> {title}
      </h3>
      {children}
    </div>
  )
}

function tzAbbr(tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value || tz
  } catch {
    return tz
  }
}

export function DayView({ data, weather }: { data: ShowDayData; weather?: WeatherData | null }) {
  const { show, advance, contacts, itinerary, prevShow, nextShow } = data
  const tz = tzAbbr(show.timezone)
  const tourName = show.tours?.name || ''
  const artistName = show.tours?.artist_name || ''

  const mapsUrl = advance?.venue_address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(advance.venue_address)}`
    : null

  const hotelMapsUrl = itinerary?.hotel_address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(itinerary.hotel_address)}`
    : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-primary-500/30 bg-primary-500/5 p-5 text-center">
        <p className="text-xs font-medium text-primary-600 dark:text-primary-400">{artistName} &bull; {tourName}</p>
        <h2 className="mt-1 text-xl font-bold">
          {show.venue_name || 'TBD'} &mdash; {show.city}{show.state ? `, ${show.state}` : ''}
        </h2>
        <p className="mt-1 text-sm text-text-muted">Show Day &bull; {tz}</p>
      </div>

      {/* Weather */}
      {weather && (
        <div className="flex items-center justify-center gap-6 rounded-xl border border-border-default bg-surface-raised p-3 text-sm">
          <span className="flex items-center gap-1"><Cloud className="h-4 w-4 text-text-muted" aria-hidden="true" /> {weather.description}</span>
          <span className="flex items-center gap-1"><Thermometer className="h-4 w-4 text-text-muted" aria-hidden="true" /> {weather.temp_high_f}&deg;/{weather.temp_low_f}&deg;F</span>
          {weather.precipitation_pct > 0 && <span className="flex items-center gap-1"><Droplets className="h-4 w-4 text-text-muted" aria-hidden="true" /> {weather.precipitation_pct}%</span>}
          {weather.wind_mph > 0 && <span className="flex items-center gap-1"><Wind className="h-4 w-4 text-text-muted" aria-hidden="true" /> {weather.wind_mph} mph</span>}
        </div>
      )}

      {/* Travel from */}
      {prevShow && itinerary?.distance_miles && (
        <div className="flex items-center gap-2 rounded-lg bg-surface-alt px-4 py-2 text-xs text-text-muted">
          <Navigation className="h-3 w-3" aria-hidden="true" />
          From {prevShow.city}{prevShow.state ? `, ${prevShow.state}` : ''}
          {' '}&mdash; {itinerary.distance_miles} miles
          {itinerary.driver_name && (
            <>
              {' '}&bull; Driver: {itinerary.driver_name}
              {itinerary.driver_phone && (
                <a href={`tel:${itinerary.driver_phone}`} className="ml-1 text-primary-600 dark:text-primary-400">
                  {itinerary.driver_phone}
                </a>
              )}
            </>
          )}
        </div>
      )}

      {/* Schedule timeline */}
      <InfoCard title="Schedule" icon={Clock}>
        <div className="flex flex-col">
          <TimeBlock time={itinerary?.bus_call_time || null} label="Bus Call" tz={tz} />
          <TimeBlock time={advance?.soundcheck_time || null} label="Soundcheck" tz={tz} />
          <TimeBlock time={advance?.doors_time || null} label="Doors" tz={tz} />
          <TimeBlock time={advance?.stage_time || null} label="Stage Time" tz={tz} />
          {advance?.performance_length_minutes && (
            <div className="ml-30 text-xs text-text-muted">
              Set: {advance.performance_length_minutes} min
            </div>
          )}
          <TimeBlock time={advance?.curfew_time || null} label="Curfew" tz={tz} />
          <TimeBlock time={itinerary?.depart_time || null} label="Depart" tz={tz} />
          {!advance?.soundcheck_time && !advance?.stage_time && (
            <p className="py-2 text-center text-xs italic text-text-muted">
              Times pending — advance sheet not yet submitted
            </p>
          )}
        </div>
      </InfoCard>

      {/* Venue card */}
      <InfoCard title="Venue" icon={MapPin}>
        <div className="space-y-2">
          <p className="font-medium">{show.venue_name || 'TBD'}</p>
          {advance?.venue_address && (
            <p className="text-sm text-text-secondary">{advance.venue_address}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {advance?.venue_phone && (
              <a
                href={`tel:${advance.venue_phone}`}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-alt px-3 py-1.5 text-xs font-medium transition-colors hover:bg-border-default"
                aria-label={`Call venue: ${advance.venue_phone}`}
              >
                <Phone className="h-3 w-3" aria-hidden="true" /> Call
              </a>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-surface-alt px-3 py-1.5 text-xs font-medium transition-colors hover:bg-border-default"
                aria-label="Navigate to venue"
              >
                <Navigation className="h-3 w-3" aria-hidden="true" /> Navigate
              </a>
            )}
          </div>
          {advance?.venue_capacity && (
            <p className="text-xs text-text-muted">Capacity: {advance.venue_capacity}</p>
          )}
          {advance?.stage_width && advance?.stage_depth && (
            <p className="text-xs text-text-muted">
              Stage: {advance.stage_width} x {advance.stage_depth} ft
            </p>
          )}
          {advance?.smoking_allowed != null && (
            <p className="flex items-center gap-1 text-xs text-text-muted">
              <Cigarette className="h-3 w-3" aria-hidden="true" />
              Smoking: {advance?.smoking_allowed ? 'Yes' : 'No'}
            </p>
          )}
        </div>
      </InfoCard>

      {/* Hotel card */}
      {itinerary?.hotel_name && (
        <InfoCard title="Hotel" icon={Hotel}>
          <div className="space-y-2">
            <p className="font-medium">{itinerary.hotel_name}</p>
            {itinerary.hotel_address && (
              <p className="text-sm text-text-secondary">{itinerary.hotel_address}</p>
            )}
            {itinerary.hotel_confirmation && (
              <p className="text-xs">
                <span className="text-text-muted">Conf#:</span>{' '}
                <span className="font-mono font-medium">{itinerary.hotel_confirmation}</span>
              </p>
            )}
            {itinerary.hotel_amenities && (
              <p className="text-xs text-text-muted">{itinerary.hotel_amenities}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {itinerary.hotel_phone && (
                <a
                  href={`tel:${itinerary.hotel_phone}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface-alt px-3 py-1.5 text-xs font-medium transition-colors hover:bg-border-default"
                  aria-label={`Call hotel: ${itinerary.hotel_phone}`}
                >
                  <Phone className="h-3 w-3" aria-hidden="true" /> Call
                </a>
              )}
              {hotelMapsUrl && (
                <a
                  href={hotelMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-surface-alt px-3 py-1.5 text-xs font-medium transition-colors hover:bg-border-default"
                  aria-label="Navigate to hotel"
                >
                  <Navigation className="h-3 w-3" aria-hidden="true" /> Navigate
                </a>
              )}
            </div>
          </div>
        </InfoCard>
      )}

      {/* Catering */}
      {(advance?.caterer_name || advance?.meal_times) && (
        <InfoCard title="Catering" icon={Utensils}>
          <div className="space-y-1 text-sm">
            {advance?.caterer_name && <p>{advance.caterer_name}</p>}
            {advance?.meal_times && <p className="text-text-muted">{advance.meal_times}</p>}
          </div>
        </InfoCard>
      )}

      {/* Dressing rooms */}
      {advance?.dressing_room_count && (
        <InfoCard title="Dressing Rooms" icon={Users}>
          <div className="space-y-1 text-sm">
            <p>{advance.dressing_room_count} room{advance.dressing_room_count > 1 ? 's' : ''}</p>
            {advance.dressing_room_location && (
              <p className="text-text-muted">{advance.dressing_room_location}</p>
            )}
          </div>
        </InfoCard>
      )}

      {/* Sound */}
      {advance?.sound_company_name && (
        <InfoCard title="Sound" icon={Volume2}>
          <div className="flex items-center justify-between text-sm">
            <p>{advance.sound_company_name}</p>
            {advance.sound_company_phone && (
              <a
                href={`tel:${advance.sound_company_phone}`}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-alt px-3 py-1.5 text-xs font-medium transition-colors hover:bg-border-default"
              >
                <Phone className="h-3 w-3" aria-hidden="true" /> Call
              </a>
            )}
          </div>
        </InfoCard>
      )}

      {/* Merch */}
      {advance?.merch_area_description && (
        <InfoCard title="Merch" icon={Music}>
          <p className="text-sm">{advance.merch_area_description}</p>
        </InfoCard>
      )}

      {/* Key contacts */}
      {contacts.length > 0 && (
        <InfoCard title="Contacts" icon={Phone}>
          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium capitalize">{c.role}</span>
                  {c.contact_name && <span className="text-text-secondary"> &mdash; {c.contact_name}</span>}
                  {c.company_name && <span className="text-text-muted"> ({c.company_name})</span>}
                </div>
                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface-alt px-2 py-1 text-xs transition-colors hover:bg-border-default"
                    aria-label={`Call ${c.role}: ${c.phone}`}
                  >
                    <Phone className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Next destination */}
      {nextShow && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-surface-alt px-4 py-3 text-sm text-text-muted">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          Next: {nextShow.city}{nextShow.state ? `, ${nextShow.state}` : ''} &mdash;{' '}
          {new Date(nextShow.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      )}

      {/* Full details link */}
      <div className="text-center">
        <Link
          href={`/tours/${show.tour_id}/shows/${show.id}`}
          className="text-xs text-primary-600 hover:underline dark:text-primary-400"
        >
          View full show details
        </Link>
      </div>
    </div>
  )
}
