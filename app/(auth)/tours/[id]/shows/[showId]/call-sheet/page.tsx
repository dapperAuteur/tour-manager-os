import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, MapPin, Phone, Users, Utensils, Volume2 } from 'lucide-react'
import { getShow } from '@/lib/tours/queries'
import { getTravelArrangements } from '@/lib/travel/queries'
import { listShowContacts } from '@/lib/shows/contacts'
import { PrintButtonClient } from './print-button'

export const metadata: Metadata = {
  title: 'Crew Call Sheet',
  robots: { index: false },
}

export default async function CallSheetPage({
  params,
}: {
  params: Promise<{ id: string; showId: string }>
}) {
  const { id: tourId, showId } = await params

  let show
  try {
    show = await getShow(showId)
  } catch {
    notFound()
  }
  if (!show) notFound()

  const advance = show.advance_sheets?.[0]
  const sheetContacts = advance?.advance_contacts || []
  const overrides = await listShowContacts(showId)
  const arrangements = await getTravelArrangements(tourId)
  const hotelForThisShow = arrangements.find(
    (a) => a.arrangement_type === 'hotel' && a.show_id === showId,
  )

  const showDate = new Date(show.date)
  const dateLong = showDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-4 py-6 sm:px-6 print:max-w-none print:px-0 print:py-2"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link
          href={`/tours/${tourId}/shows/${showId}`}
          className="text-sm text-text-muted hover:text-text-secondary"
        >
          &larr; Back to show
        </Link>
        <PrintButtonClient />
      </div>

      <article className="rounded-xl border border-border-default bg-surface-raised p-6 print:border-0 print:p-0">
        <header className="mb-6 border-b border-border-default pb-4 print:pb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Crew Call Sheet
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            {show.venue_name || show.city}
          </h1>
          <p className="mt-1 text-sm">
            {dateLong}
            <span className="mx-2 text-text-muted">&middot;</span>
            {show.city}
            {show.state ? `, ${show.state}` : ''}
            {show.country && show.country !== 'US' ? `, ${show.country}` : ''}
          </p>
        </header>

        {/* Times */}
        <Section title="Times" icon={Clock}>
          <Grid>
            <Row label="Soundcheck" value={advance?.soundcheck_time} />
            <Row label="Doors" value={advance?.doors_time} />
            <Row label="Stage" value={advance?.stage_time} highlight />
            <Row label="Curfew" value={advance?.curfew_time} />
            <Row
              label="Set length"
              value={
                advance?.performance_length_minutes
                  ? `${advance.performance_length_minutes} min`
                  : undefined
              }
            />
          </Grid>
        </Section>

        {/* Venue */}
        <Section title="Venue" icon={MapPin}>
          <Row label="Address" value={advance?.venue_address} />
          <Row label="Phone" value={advance?.venue_phone} icon={Phone} />
          <Row label="Backstage" value={advance?.venue_backstage_phone} icon={Phone} />
          <Row label="Type" value={advance?.venue_type} />
          <Row label="Capacity" value={advance?.venue_capacity} />
          <Row
            label="Stage"
            value={
              advance?.stage_width && advance?.stage_depth
                ? `${advance.stage_width} × ${advance.stage_depth}${advance.stage_height ? ` × ${advance.stage_height}` : ''} ft`
                : undefined
            }
          />
          <Row label="PA system" value={advance?.pa_system} />
        </Section>

        {/* Hospitality + Catering */}
        <Section title="Hospitality & Catering" icon={Utensils}>
          <Row label="Caterer" value={advance?.caterer_name} />
          <Row label="Caterer phone" value={advance?.caterer_phone} icon={Phone} />
          <Row label="Meal times" value={advance?.meal_times} />
          <Row
            label="Hospitality"
            value={advance?.hospitality_provider_name}
          />
          <Row
            label="Hospitality phone"
            value={advance?.hospitality_provider_phone}
            icon={Phone}
          />
          <Row label="Per diem contact" value={advance?.per_diem_contact_name} />
        </Section>

        {/* Dressing rooms */}
        <Section title="Dressing Rooms" icon={Users}>
          <Row label="Count" value={advance?.dressing_room_count} />
          <Row label="Location" value={advance?.dressing_room_location} />
          <Row label="Shower" value={yesNo(advance?.dressing_room_shower)} />
          <Row label="Lockable" value={yesNo(advance?.dressing_room_lockable)} />
          <Row label="Security" value={advance?.security_guard_name} />
          <Row label="Security phone" value={advance?.security_guard_phone} icon={Phone} />
        </Section>

        {/* Production */}
        <Section title="Production" icon={Volume2}>
          <Row label="Stage door" value={yesNo(advance?.has_stage_door)} />
          <Row label="Rear door" value={yesNo(advance?.has_rear_door)} />
          <Row label="Backstage parking" value={yesNo(advance?.has_backstage_parking)} />
          <Row label="Smoke OK" value={yesNo(advance?.has_smoke_machines)} />
          <Row label="Merch area" value={advance?.merch_area_description} />
        </Section>

        {/* Hotel */}
        {hotelForThisShow && (
          <Section title="Hotel" icon={MapPin}>
            <Row label="Vendor" value={hotelForThisShow.vendor_name} />
            <Row label="Confirmation #" value={hotelForThisShow.confirmation_number} />
            <Row
              label="Check-in"
              value={
                hotelForThisShow.check_in
                  ? new Date(hotelForThisShow.check_in).toLocaleDateString()
                  : undefined
              }
            />
            <Row
              label="Check-out"
              value={
                hotelForThisShow.check_out
                  ? new Date(hotelForThisShow.check_out).toLocaleDateString()
                  : undefined
              }
            />
            <Row label="Address" value={hotelForThisShow.address} />
            <Row label="Phone" value={hotelForThisShow.phone} icon={Phone} />
          </Section>
        )}

        {/* Contacts */}
        {(sheetContacts.length > 0 || overrides.length > 0) && (
          <Section title="Contacts" icon={Phone}>
            {overrides.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Pinned for this show
                </p>
                <ul className="mt-1 space-y-1">
                  {overrides
                    .filter((o) => o.contact !== null)
                    .map((o) => (
                      <li key={o.contact_id} className="text-sm">
                        <span className="font-semibold">{o.contact!.name}</span>
                        <span className="ml-2 text-text-muted">
                          ({o.role_override || o.contact!.role})
                        </span>
                        {o.contact!.phone && (
                          <span className="ml-2">{o.contact!.phone}</span>
                        )}
                        {o.note && (
                          <span className="ml-2 italic text-text-muted">
                            &ldquo;{o.note}&rdquo;
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {sheetContacts.length > 0 && (
              <ul className="space-y-1">
                {sheetContacts.map((c) => (
                  <li key={c.id} className="text-sm">
                    <span className="font-semibold">{c.contact_name || c.company_name || c.role}</span>
                    <span className="ml-2 text-text-muted capitalize">
                      ({c.role.replace('_', ' ')})
                    </span>
                    {c.phone && <span className="ml-2">{c.phone}</span>}
                    {c.email && <span className="ml-2 text-text-muted">{c.email}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        <p className="mt-6 text-[10px] text-text-muted print:mt-3">
          Generated from Tour Manager OS. Times reflect the latest advance.
          Reach the production lead before changing anything time-sensitive.
        </p>
      </article>
    </main>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <section className="mb-5 break-inside-avoid">
      <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        <Icon className="size-3.5" aria-hidden />
        {title}
      </h2>
      <div>{children}</div>
    </section>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">{children}</div>
}

function Row({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string
  value: string | number | null | undefined
  icon?: React.ComponentType<{ className?: string }>
  highlight?: boolean
}) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex items-start gap-2 py-0.5 text-sm">
      {Icon && <Icon className="mt-0.5 size-3.5 shrink-0 text-text-muted" aria-hidden />}
      <span className="text-text-muted">{label}:</span>
      <span className={`font-medium ${highlight ? 'text-primary-700 dark:text-primary-400' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function yesNo(b: boolean | null | undefined): string | undefined {
  if (b === null || b === undefined) return undefined
  return b ? 'Yes' : 'No'
}

