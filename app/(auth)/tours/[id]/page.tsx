import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Send, MapPin, Calendar, Clock, ExternalLink, FileText, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTour } from '@/lib/tours/queries'

export const metadata: Metadata = {
  title: 'Tour Details',
}

const showStatusColors: Record<string, string> = {
  draft: 'bg-text-muted/20 text-text-muted',
  advance_sent: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  confirmed: 'bg-success-500/20 text-success-600 dark:text-success-500',
  completed: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  cancelled: 'bg-error-500/20 text-error-600 dark:text-error-500',
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const tour = await getTour(id)

  const shows = (tour.shows || []).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const isManager = tour.tour_members?.some(
    (m) => m.user_id === user?.id && m.role === 'manager'
  )

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Tour header */}
        <div className="mb-8">
          <Link href="/dashboard" className="mb-2 inline-block text-sm text-text-muted hover:text-text-secondary">
            &larr; All Tours
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{tour.name}</h1>
              <p className="text-text-secondary">{tour.artist_name}</p>
              {tour.description && (
                <p className="mt-1 text-sm text-text-muted">{tour.description}</p>
              )}
            </div>
            {tour.start_date && tour.end_date && (
              <div className="flex items-center gap-1 text-sm text-text-muted">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {new Date(tour.start_date).toLocaleDateString()} &ndash; {new Date(tour.end_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 flex gap-3">
          <Link
            href={`/tours/${id}/itinerary`}
            className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            View Itinerary
          </Link>
          <Link
            href={`/tours/${id}/finances`}
            className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <DollarSign className="h-4 w-4" aria-hidden="true" />
            Finances
          </Link>
        </div>

        {/* Shows */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Shows ({shows.length})</h2>
          {isManager && (
            <Link
              href={`/tours/${id}/shows/new`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Show
            </Link>
          )}
        </div>

        {shows.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
            <MapPin className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">No shows added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shows.map((show) => {
              const advanceSheet = Array.isArray(show.advance_sheets)
                ? show.advance_sheets[0]
                : show.advance_sheets
              const advanceLink = advanceSheet?.token
                ? `/advance/${advanceSheet.token}`
                : null

              return (
                <div
                  key={show.id}
                  className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-surface-alt text-center">
                      <span className="text-xs font-medium text-text-muted">
                        {new Date(show.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold leading-tight">
                        {new Date(show.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <Link
                        href={`/tours/${id}/shows/${show.id}`}
                        className="font-medium hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {show.venue_name || 'TBD'} &mdash; {show.city}{show.state ? `, ${show.state}` : ''}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {new Date(show.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 font-medium ${showStatusColors[show.status] || showStatusColors.draft}`}>
                          {show.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {advanceLink && isManager && (
                      <Link
                        href={advanceLink}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label={`Open advance sheet for ${show.venue_name || show.city}`}
                      >
                        <Send className="h-3 w-3" aria-hidden="true" />
                        Advance
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    )}
                    <Link
                      href={`/tours/${id}/shows/${show.id}`}
                      className="rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Members */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Team ({tour.tour_members?.length || 0})</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tour.tour_members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-raised p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {member.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.display_name}</p>
                  <p className="text-xs text-text-muted capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
  )
}
