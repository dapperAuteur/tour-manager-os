import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { listExclusiveForShow } from '@/lib/exclusive-content/queries'
import { ExclusiveContentEditor } from './exclusive-content-editor'

export const metadata: Metadata = {
  title: 'Exclusive Content',
  robots: { index: false },
}

export default async function ExclusiveContentPage({
  params,
}: {
  params: Promise<{ id: string; showId: string }>
}) {
  const { id: tourId, showId } = await params
  const supabase = await createClient()
  const { data: show } = await supabase
    .from('shows')
    .select(
      'id, date, city, state, venue_name, tour_id, tours:tour_id(org_id, name)',
    )
    .eq('id', showId)
    .maybeSingle()
  if (!show) notFound()

  const tour = show.tours as unknown as { org_id: string; name: string } | null
  const orgId = tour?.org_id ?? ''
  const pieces = await listExclusiveForShow(showId)

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href={`/tours/${tourId}/shows/${showId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Back to show
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Lock className="size-5" aria-hidden /> Exclusive content
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {show.venue_name || show.city} —{' '}
          {new Date(show.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          · {tour?.name ?? 'Tour'}
        </p>
        <p className="mt-2 text-xs text-text-muted">
          Pre-show content unlocks before doors. Post-show unlocks the
          hours after. Both gate by email — fans drop the address they
          signed up with on the public event page and the content
          appears if it matches your subscriber list.
        </p>
      </header>

      <ExclusiveContentEditor
        showId={showId}
        orgId={orgId}
        initial={pieces}
      />
    </main>
  )
}
