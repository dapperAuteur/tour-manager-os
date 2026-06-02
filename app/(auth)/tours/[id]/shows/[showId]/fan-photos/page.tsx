import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Image as ImageIcon } from 'lucide-react'
import { getShow } from '@/lib/tours/queries'
import { createClient } from '@/lib/supabase/server'
import { ModerationQueue } from './moderation-queue'

export const metadata: Metadata = {
  title: 'Fan Photos — Moderation',
}

interface PageProps {
  params: Promise<{ id: string; showId: string }>
}

export default async function FanPhotosModerationPage({ params }: PageProps) {
  const { id: tourId, showId } = await params
  const show = await getShow(showId)
  const supabase = await createClient()

  const { data: photos } = await supabase
    .from('fan_photos')
    .select(
      `id, cloudinary_url, width, height, caption, status, submitted_at,
       moderated_at, rejection_reason, user_id,
       ai_moderation_verdict, ai_auto_rejected`,
    )
    .eq('show_id', showId)
    .order('submitted_at', { ascending: true })
    .limit(200)

  const all = photos || []
  const counts = {
    pending: all.filter((p) => p.status === 'pending').length,
    approved: all.filter((p) => p.status === 'approved').length,
    rejected: all.filter((p) => p.status === 'rejected').length,
    removed: all.filter((p) => p.status === 'removed').length,
  }

  const venue =
    show.venue_name ||
    `${show.city}${show.state ? ', ' + show.state : ''}`

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href={`/tours/${tourId}/shows/${showId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden /> Back to Show
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-text-muted">
            <ImageIcon className="size-4" aria-hidden /> Fan Photos
          </div>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{venue}</h1>
          <p className="mt-1 text-sm text-text-muted">
            <time dateTime={show.date}>
              {new Date(show.date).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </p>
        </div>
        <Link
          href={`/shows/${showId}/photos`}
          className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-sm hover:bg-surface-hover"
        >
          View public wall
        </Link>
      </div>

      <ModerationQueue photos={all} counts={counts} showId={showId} />
    </main>
  )
}
