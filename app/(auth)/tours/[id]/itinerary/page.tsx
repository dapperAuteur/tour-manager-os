import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Calendar, MapPin, Clock, Phone, Hotel, Music, Utensils, Volume2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getItineraryForTour } from '@/lib/itinerary/queries'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'Tour Itinerary',
}

export default async function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tourId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { shows, itineraryDays, tour } = await getItineraryForTour(tourId)

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link href={`/tours/${tourId}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">
          &larr; Back to Tour
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tour?.artist_name || 'Tour'}</h1>
            <p className="text-text-secondary">Daily Itinerary &mdash; {tour?.name}</p>
          </div>
          <button
            type="button"
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="hidden rounded-lg border border-border-default px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt sm:inline-flex"
          >
            Print
          </button>
        </div>

        {shows.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">No shows scheduled yet. Add shows to generate the itinerary.</p>
          </div>
        ) : (
          <div className="space-y-6 print:space-y-4">
            {shows.map((show, index) => {
              const advance = Array.isArray(show.advance_sheets) ? show.advance_sheets[0] : null
              const contacts: { id: string; role: string; contact_name: string | null; phone: string | null }[] = advance?.advance_contacts || []
              const itDay = itineraryDays.find((d) => d.show_id === show.id || d.date === show.date)
              const prevShow = index > 0 ? shows[index - 1] : null

              return (
                <article
                  key={show.id}
                  className="rounded-xl border border-border-default bg-surface-raised print:break-inside-avoid print:border-black"
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between border-b border-border-default bg-surface-alt px-5 py-3 print:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-xs font-medium text-text-muted">
                          {new Date(show.date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-xl font-bold">{new Date(show.date).getDate()}</p>
                      </div>
                      <div>
                        <h2 className="font-semibold">
                          {show.venue_name || 'TBD'} &mdash; {show.city}{show.state ? `, ${show.state}` : ''}
                        </h2>
                        <p className="text-xs text-text-muted">
                          {new Date(show.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          {' '}&bull;{' '}Show Day
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/tours/${tourId}/shows/${show.id}`}
                      className="text-xs text-primary-600 hover:underline dark:text-primary-400 print:hidden"
                    >
                      Full Details
                    </Link>
                  </div>

                  <div className="grid gap-4 p-5 sm:grid-cols-2 print:grid-cols-2">
                    {/* Travel info */}
                    {prevShow && (
                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          Travel from {prevShow.city}{prevShow.state ? `, ${prevShow.state}` : ''}
                          {itDay?.distance_miles && ` — ${itDay.distance_miles} miles`}
                          {itDay?.drive_time_hours && ` (${itDay.drive_time_hours} hrs)`}
                          {itDay?.driver_name && ` — Driver: ${itDay.driver_name}`}
                        </div>
                      </div>
                    )}

                    {/* Schedule */}
                    <div>
                      <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-text-muted">
                        <Clock className="h-3 w-3" aria-hidden="true" /> Today&apos;s Schedule
                      </h3>
                      <div className="space-y-1 text-sm">
                        {itDay?.bus_call_time && (
                          <p><span className="font-medium">{itDay.bus_call_time}</span> — Bus Call</p>
                        )}
                        {advance?.soundcheck_time && (
                          <p><span className="font-medium">{advance.soundcheck_time}</span> — Soundcheck</p>
                        )}
                        {advance?.doors_time && (
                          <p><span className="font-medium">{advance.doors_time}</span> — Doors</p>
                        )}
                        {advance?.stage_time && (
                          <p><span className="font-medium">{advance.stage_time}</span> — Stage Time</p>
                        )}
                        {advance?.performance_length_minutes && (
                          <p className="text-xs text-text-muted">Set Length: {advance.performance_length_minutes} min</p>
                        )}
                        {advance?.curfew_time && (
                          <p><span className="font-medium">{advance.curfew_time}</span> — Curfew</p>
                        )}
                        {!advance?.soundcheck_time && !advance?.doors_time && !advance?.stage_time && (
                          <p className="text-xs italic text-text-muted">Times pending — advance sheet not yet submitted</p>
                        )}
                      </div>
                    </div>

                    {/* Venue info */}
                    <div>
                      <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-text-muted">
                        <MapPin className="h-3 w-3" aria-hidden="true" /> Venue
                      </h3>
                      <div className="space-y-1 text-sm">
                        {advance?.venue_address && <p>{advance.venue_address}</p>}
                        {advance?.venue_phone && (
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-text-muted" aria-hidden="true" /> {advance.venue_phone}
                          </p>
                        )}
                        {advance?.venue_capacity && <p className="text-xs text-text-muted">Capacity: {advance.venue_capacity}</p>}
                        {advance?.stage_width && advance?.stage_depth && (
                          <p className="text-xs text-text-muted">
                            Stage: {advance.stage_width} x {advance.stage_depth} ft
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Hotel */}
                    {itDay?.hotel_name && (
                      <div>
                        <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-text-muted">
                          <Hotel className="h-3 w-3" aria-hidden="true" /> Hotel
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{itDay.hotel_name}</p>
                          {itDay.hotel_address && <p className="text-xs">{itDay.hotel_address}</p>}
                          {itDay.hotel_phone && (
                            <p className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3 text-text-muted" aria-hidden="true" /> {itDay.hotel_phone}
                            </p>
                          )}
                          {itDay.hotel_confirmation && (
                            <p className="text-xs text-text-muted">Conf#: {itDay.hotel_confirmation}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Catering */}
                    {(advance?.caterer_name || advance?.meal_times) && (
                      <div>
                        <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-text-muted">
                          <Utensils className="h-3 w-3" aria-hidden="true" /> Catering
                        </h3>
                        <div className="space-y-1 text-sm">
                          {advance.caterer_name && <p>{advance.caterer_name}</p>}
                          {advance.meal_times && <p className="text-xs text-text-muted">{advance.meal_times}</p>}
                        </div>
                      </div>
                    )}

                    {/* Sound */}
                    {advance?.sound_company_name && (
                      <div>
                        <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-text-muted">
                          <Volume2 className="h-3 w-3" aria-hidden="true" /> Sound
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p>{advance.sound_company_name}</p>
                          {advance.sound_company_phone && (
                            <p className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3 text-text-muted" aria-hidden="true" /> {advance.sound_company_phone}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Key Contacts */}
                    {contacts.length > 0 && (
                      <div className="sm:col-span-2">
                        <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-text-muted">
                          <Phone className="h-3 w-3" aria-hidden="true" /> Key Contacts
                        </h3>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {contacts.map((c) => (
                            <span key={c.id} className="rounded bg-surface-alt px-2 py-1">
                              <span className="font-medium capitalize">{c.role}:</span>{' '}
                              {c.contact_name}{c.phone ? ` (${c.phone})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Merch */}
                    {advance?.merch_area_description && (
                      <div className="sm:col-span-2">
                        <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-text-muted">
                          <Music className="h-3 w-3" aria-hidden="true" /> Merch
                        </h3>
                        <p className="text-sm">{advance.merch_area_description}</p>
                      </div>
                    )}

                    {/* Departure */}
                    {itDay?.depart_time && (
                      <div className="sm:col-span-2 border-t border-border-default pt-3">
                        <p className="text-xs text-text-muted">
                          <span className="font-medium">Depart:</span> {itDay.depart_time}
                          {itDay.next_destination && ` → ${itDay.next_destination}`}
                          {itDay.next_distance_miles && ` (${itDay.next_distance_miles} mi)`}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
