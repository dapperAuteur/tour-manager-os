import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, CalendarCheck, MapPin, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getPracticeSessions } from '@/lib/hub/queries'
import { RsvpButtons } from './rsvp-buttons'

export const metadata: Metadata = { title: 'Practice', robots: { index: false } }

function tzAbbr(tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value || tz
  } catch { return tz }
}

export default async function PracticePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="mx-auto max-w-4xl px-4 py-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const sessions = await getPracticeSessions(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/hub" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Family Hub</Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Practice Sessions</h1>
        <Link href="/hub/practice/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> Schedule Practice
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No practice sessions scheduled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const tz = tzAbbr(session.timezone)
            const rsvps = Array.isArray(session.practice_rsvps) ? session.practice_rsvps : []
            const goingCount = rsvps.filter((r: { status: string }) => r.status === 'going').length
            const userRsvp = rsvps.find((r: { user_id: string }) => r.user_id === user.id)

            return (
              <div key={session.id} className="rounded-xl border border-border-default bg-surface-raised p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold">{session.title}</h2>
                    {session.description && <p className="mt-1 text-sm text-text-secondary">{session.description}</p>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    session.status === 'scheduled' ? 'bg-success-500/20 text-success-600 dark:text-success-500'
                    : session.status === 'cancelled' ? 'bg-error-500/20 text-error-500'
                    : 'bg-text-muted/20 text-text-muted'
                  }`}>
                    {session.status}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="h-3 w-3" aria-hidden="true" />
                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {session.start_time}{session.end_time ? ` – ${session.end_time}` : ''} {tz}
                  </span>
                  {session.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {session.location}
                    </span>
                  )}
                  <span>{goingCount} going</span>
                </div>

                {session.status === 'scheduled' && (
                  <RsvpButtons sessionId={session.id} currentStatus={(userRsvp as { status: string } | undefined)?.status || null} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
