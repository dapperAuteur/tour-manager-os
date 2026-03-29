import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MapPin, Phone, Mail, Clock, Users, Music, Utensils, Volume2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getShow } from '@/lib/tours/queries'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'Show Details',
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | number | null | undefined; icon?: React.ComponentType<{ className?: string }> }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />}
      <div>
        <span className="text-text-muted">{label}:</span>{' '}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  )
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

export default async function ShowDetailPage({ params }: { params: Promise<{ id: string; showId: string }> }) {
  const { id: tourId, showId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const show = await getShow(showId)
  const advance = show.advance_sheets?.[0]
  const contacts = advance?.advance_contacts || []
  const otherArtists = advance?.advance_other_artists || []
  const advanceLink = advance?.token ? `/advance/${advance.token}` : null

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href={`/tours/${tourId}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">
          &larr; Back to Tour
        </Link>

        {/* Show header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {show.venue_name || 'TBD'} &mdash; {show.city}{show.state ? `, ${show.state}` : ''}
            </h1>
            <p className="text-text-secondary">
              {new Date(show.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            {advanceLink && (
              <Link
                href={advanceLink}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-lg border border-border-default px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Advance Sheet
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {!advance || advance.status === 'pending' ? (
          <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-6 text-center">
            <p className="font-medium text-warning-600 dark:text-warning-500">Advance sheet not yet submitted</p>
            {advanceLink && (
              <p className="mt-2 text-sm text-text-secondary">
                Share this link with the venue contact:{' '}
                <code className="rounded bg-surface-alt px-2 py-0.5 text-xs">
                  {typeof window !== 'undefined' ? window.location.origin : ''}{advanceLink}
                </code>
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Venue */}
            <Card title="Venue" icon={MapPin}>
              <InfoRow label="Type" value={advance.venue_type} />
              <InfoRow label="Capacity" value={advance.venue_capacity} />
              <InfoRow label="Address" value={advance.venue_address} icon={MapPin} />
              <InfoRow label="Phone" value={advance.venue_phone} icon={Phone} />
              <InfoRow label="Backstage" value={advance.venue_backstage_phone} icon={Phone} />
            </Card>

            {/* Show Times */}
            <Card title="Show Details" icon={Clock}>
              <InfoRow label="Soundcheck" value={advance.soundcheck_time} icon={Clock} />
              <InfoRow label="Doors" value={advance.doors_time} icon={Clock} />
              <InfoRow label="Stage Time" value={advance.stage_time} icon={Clock} />
              <InfoRow label="Curfew" value={advance.curfew_time} icon={Clock} />
              <InfoRow label="Set Length" value={advance.performance_length_minutes ? `${advance.performance_length_minutes} min` : null} />
              <InfoRow label="Format" value={advance.show_format} />
              <InfoRow label="Ticket Price" value={advance.ticket_price ? `$${advance.ticket_price}` : null} />
              <InfoRow label="Total Gross" value={advance.total_gross ? `$${Number(advance.total_gross).toLocaleString()}` : null} />
              <InfoRow label="Smoking" value={advance.smoking_allowed ? 'Yes' : 'No'} />
            </Card>

            {/* Production */}
            <Card title="Production" icon={Volume2}>
              <InfoRow label="Stage" value={
                advance.stage_width && advance.stage_depth
                  ? `${advance.stage_width} x ${advance.stage_depth}${advance.stage_height ? ` x ${advance.stage_height}` : ''} ft`
                  : null
              } />
              <InfoRow label="PA System" value={advance.pa_system} />
              <InfoRow label="Stage Door" value={advance.has_stage_door ? 'Yes' : 'No'} />
              <InfoRow label="Rear Door" value={advance.has_rear_door ? 'Yes' : 'No'} />
              <InfoRow label="Backstage Parking" value={advance.has_backstage_parking ? 'Yes' : 'No'} />
              <InfoRow label="Smoke Machines" value={advance.has_smoke_machines ? 'Yes' : 'No'} />
              {advance.smoke_machine_notes && <InfoRow label="Notes" value={advance.smoke_machine_notes} />}
              <InfoRow label="Merch Area" value={advance.merch_area_description} />
            </Card>

            {/* Catering */}
            <Card title="Catering" icon={Utensils}>
              <InfoRow label="Caterer" value={advance.caterer_name} />
              <InfoRow label="Phone" value={advance.caterer_phone} icon={Phone} />
              <InfoRow label="Meal Times" value={advance.meal_times} />
              <InfoRow label="Per Diem Contact" value={advance.per_diem_contact_name} />
              <InfoRow label="Hospitality" value={advance.hospitality_provider_name} />
            </Card>

            {/* Dressing Rooms */}
            <Card title="Dressing Rooms" icon={Users}>
              <InfoRow label="Count" value={advance.dressing_room_count} />
              <InfoRow label="Location" value={advance.dressing_room_location} />
              <InfoRow label="Lockable" value={advance.dressing_room_lockable ? 'Yes' : 'No'} />
              <InfoRow label="Wash Basin" value={advance.dressing_room_washbasin ? 'Yes' : 'No'} />
              <InfoRow label="Toilet" value={advance.dressing_room_toilet ? 'Yes' : 'No'} />
              <InfoRow label="Shower" value={advance.dressing_room_shower ? 'Yes' : 'No'} />
              {advance.security_guard_name && (
                <InfoRow label="Security" value={`${advance.security_guard_name}${advance.security_guard_phone ? ` (${advance.security_guard_phone})` : ''}`} />
              )}
            </Card>

            {/* Sound Company */}
            <Card title="Sound Company" icon={Volume2}>
              <InfoRow label="Company" value={advance.sound_company_name} />
              <InfoRow label="Phone" value={advance.sound_company_phone} icon={Phone} />
              <InfoRow label="Email" value={advance.sound_company_email} icon={Mail} />
            </Card>

            {/* Contacts */}
            {contacts.length > 0 && (
              <div className="md:col-span-2">
                <Card title="Contacts" icon={Users}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="rounded-lg border border-border-default p-3">
                        <p className="text-xs font-semibold uppercase text-text-muted">{contact.role}</p>
                        {contact.company_name && <p className="text-sm font-medium">{contact.company_name}</p>}
                        {contact.contact_name && <p className="text-sm">{contact.contact_name}</p>}
                        {contact.phone && <p className="text-xs text-text-secondary">{contact.phone}</p>}
                        {contact.email && <p className="text-xs text-text-secondary">{contact.email}</p>}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Other Artists */}
            {otherArtists.length > 0 && (
              <div className="md:col-span-2">
                <Card title="Other Artists on Show" icon={Music}>
                  <div className="space-y-2">
                    {otherArtists.map((artist) => (
                      <div key={artist.id} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                        <div>
                          <p className="text-sm font-medium">{artist.artist_name}</p>
                          <p className="text-xs text-text-muted capitalize">{artist.slot?.replace('_', ' ')}</p>
                        </div>
                        {artist.set_length_minutes && (
                          <span className="text-xs text-text-muted">{artist.set_length_minutes} min</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}
