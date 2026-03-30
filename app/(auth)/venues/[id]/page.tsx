import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Phone, Star, Globe, Users, Volume2, Ruler, Car } from 'lucide-react'
import { getVenueProfile } from '@/lib/venues/queries'
import { RatingForm } from './rating-form'

export const metadata: Metadata = { title: 'Venue Profile', robots: { index: false } }

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= Math.round(rating) ? 'fill-warning-500 text-warning-500' : 'text-border-default'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number | boolean | null | undefined }) {
  if (value === null || value === undefined) return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
      <div><span className="text-text-muted">{label}:</span> <span className="font-medium">{display}</span></div>
    </div>
  )
}

export default async function VenueProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data
  try { data = await getVenueProfile(id) } catch { notFound() }

  const { venue, ratings, notes, avgRating, ratingCount } = data

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/venues" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Venue Network</Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{venue.name}</h1>
        <p className="mt-1 text-text-secondary">{venue.city}{venue.state ? `, ${venue.state}` : ''}{venue.country && venue.country !== 'US' ? `, ${venue.country}` : ''}</p>
        <div className="mt-2 flex items-center gap-4">
          {ratingCount > 0 && (
            <div className="flex items-center gap-2">
              <Stars rating={avgRating} />
              <span className="text-sm text-text-muted">{avgRating} ({ratingCount} rating{ratingCount !== 1 ? 's' : ''})</span>
            </div>
          )}
          {venue.venue_type && <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs capitalize">{venue.venue_type}</span>}
          {venue.times_played > 0 && <span className="text-xs text-text-muted">{venue.times_played} show{venue.times_played !== 1 ? 's' : ''} played</span>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Venue details */}
        <div className="rounded-xl border border-border-default bg-surface-raised p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">Venue Details</h2>
          <div className="space-y-3">
            <InfoItem icon={MapPin} label="Address" value={venue.address} />
            <InfoItem icon={Phone} label="Phone" value={venue.phone} />
            <InfoItem icon={Globe} label="Website" value={venue.website} />
            <InfoItem icon={Users} label="Capacity" value={venue.capacity?.toLocaleString()} />
            <InfoItem icon={Ruler} label="Stage" value={venue.stage_width && venue.stage_depth ? `${venue.stage_width} x ${venue.stage_depth}${venue.stage_height ? ` x ${venue.stage_height}` : ''} ft` : null} />
            <InfoItem icon={Volume2} label="PA System" value={venue.pa_system} />
            <InfoItem icon={Car} label="Backstage Parking" value={venue.has_backstage_parking} />
            <InfoItem icon={MapPin} label="Stage Door" value={venue.has_stage_door} />
            <InfoItem icon={Users} label="Dressing Rooms" value={venue.dressing_room_count} />
          </div>
        </div>

        {/* Rate this venue */}
        <div className="rounded-xl border border-border-default bg-surface-raised p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">Rate This Venue</h2>
          <RatingForm venueId={id} />
        </div>

        {/* Reviews */}
        {ratings.length > 0 && (
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Reviews ({ratings.length})</h2>
            <div className="space-y-3">
              {ratings.map((r) => {
                const reviewer = (r.user_profiles as { display_name: string | null })?.display_name || 'Anonymous'
                return (
                  <div key={r.id} className="rounded-xl border border-border-default bg-surface-raised p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Stars rating={r.overall_rating} />
                        <span className="text-sm font-medium">{reviewer}</span>
                      </div>
                      {r.show_date && <span className="text-xs text-text-muted">{new Date(r.show_date).toLocaleDateString()}</span>}
                    </div>
                    {r.review && <p className="text-sm text-text-secondary">{r.review}</p>}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
                      {r.sound_rating && <span>Sound: {r.sound_rating}/5</span>}
                      {r.hospitality_rating && <span>Hospitality: {r.hospitality_rating}/5</span>}
                      {r.load_in_rating && <span>Load-in: {r.load_in_rating}/5</span>}
                      {r.dressing_room_rating && <span>Dressing rooms: {r.dressing_room_rating}/5</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Venue notes */}
        {notes.length > 0 && (
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Notes ({notes.length})</h2>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="rounded-xl border border-border-default bg-surface-raised p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-text-muted capitalize">{note.category?.replace('_', ' ') || 'general'}</span>
                    <span className="text-xs text-text-muted">{(note.user_profiles as { display_name: string | null })?.display_name}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
