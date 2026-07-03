import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  Calendar,
  Camera,
  Clock,
  ListMusic,
  MapPin,
  Music,
  Ticket,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import {
  getPublicShow,
  listRecentPublishedFanPhotos,
} from '@/lib/shows/public'
import { ExclusiveUnlock } from './exclusive-unlock'
import { LiveStreamEmbed } from './live-stream-embed'
import { getStreamEmbedCode, getStreamPlaybackUrl } from '@/lib/streaming/viloud'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const show = await getPublicShow(id)
  if (!show) return { title: 'Show' }
  const dateStr = new Date(show.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const where = show.venue_name
    ? `${show.venue_name}, ${show.city}`
    : show.city
  const title = `${show.artist_name} — ${dateStr} (${where})`
  return {
    title,
    description: `${show.artist_name} live at ${where} on ${dateStr}.`,
    openGraph: {
      title,
      description: `${show.artist_name} live at ${where} on ${dateStr}.`,
      type: 'website',
    },
  }
}

export default async function PublicShowPage({ params }: PageProps) {
  const { id } = await params
  const show = await getPublicShow(id)
  if (!show) notFound()

  const photos = show.fan_photo_count > 0
    ? await listRecentPublishedFanPhotos(id, 6)
    : []

  const dateLabel = new Date(show.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const wherePrimary = show.venue_name || show.city
  const whereSecondary = show.venue_name
    ? `${show.city}${show.state ? `, ${show.state}` : ''}`
    : show.state || null

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-10 text-center">
          <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            <Music className="size-3.5" aria-hidden /> {show.tour_name}
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {show.artist_name}
          </h1>
          <p className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm text-text-secondary">
            <Calendar className="size-4" aria-hidden /> {dateLabel}
          </p>
          <p className="mt-1 inline-flex items-center justify-center gap-1.5 text-sm text-text-secondary">
            <MapPin className="size-4" aria-hidden /> {wherePrimary}
            {whereSecondary && (
              <span className="text-text-muted">&middot; {whereSecondary}</span>
            )}
          </p>
        </header>

        {/* Live stream — only when the tour team flipped this show live */}
        {show.stream_live && (
          <LiveStreamEmbed
            embedHtml={getStreamEmbedCode()}
            playbackUrl={getStreamPlaybackUrl()}
          />
        )}

        {/* Times */}
        {(show.doors_time || show.stage_time || show.curfew_time) && (
          <section
            aria-label="Show times"
            className="mb-8 rounded-xl border border-border-default bg-surface-raised p-5"
          >
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
              <Clock className="size-4" aria-hidden /> Times
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {show.doors_time && (
                <TimeRow label="Doors" value={show.doors_time} />
              )}
              {show.stage_time && (
                <TimeRow label="Show" value={show.stage_time} highlight />
              )}
              {show.curfew_time && (
                <TimeRow label="Curfew" value={show.curfew_time} />
              )}
            </div>
          </section>
        )}

        {/* Tickets */}
        <section
          aria-label="Tickets"
          className="mb-8 rounded-xl border border-primary-500/30 bg-primary-500/5 p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Ticket className="size-5 text-primary-600 dark:text-primary-400" aria-hidden /> Tickets
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {show.has_tickets_for_sale ? (
                  <>
                    Buy directly &mdash; QR delivered by email, scan at the door.
                    {show.ticket_count_total > 0 &&
                      show.ticket_count_remaining > 0 && (
                        <>
                          {' '}
                          <span className="text-text-muted">
                            ({show.ticket_count_remaining} of {show.ticket_count_total} remaining)
                          </span>
                        </>
                      )}
                  </>
                ) : (
                  'Tickets not yet on sale for this show. Check back soon.'
                )}
              </p>
            </div>
            {show.has_tickets_for_sale && (
              <Link
                href={`/shows/${id}/tickets`}
                className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <Ticket className="size-4" aria-hidden /> Buy tickets
              </Link>
            )}
          </div>
        </section>

        {/* Exclusive content for subscribers */}
        {show.has_exclusive_content && (
          <section
            aria-label="Exclusive content"
            className="mb-8 rounded-xl border border-primary-500/30 bg-primary-500/5 p-5"
          >
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              Exclusive for subscribers
            </h2>
            <ExclusiveUnlock showId={id} />
          </section>
        )}

        {/* Fan photos */}
        {show.fan_photo_count > 0 && (
          <section
            aria-label="Fan photos"
            className="mb-8 rounded-xl border border-border-default bg-surface-raised p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
                <Camera className="size-4" aria-hidden /> Fan photos ({show.fan_photo_count})
              </h2>
              <Link
                href={`/shows/${id}/photos`}
                className="text-xs font-medium text-primary-700 hover:underline dark:text-primary-400"
              >
                See all &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photos.map((p) => (
                <Link
                  key={p.id}
                  href={`/photos/${p.id}`}
                  className="relative aspect-square overflow-hidden rounded-md bg-surface-alt"
                >
                  <Image
                    src={p.cloudinary_url}
                    alt={p.caption || 'Fan photo'}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform hover:scale-105"
                    unoptimized
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Setlist callout */}
        {show.has_setlist && (
          <section
            aria-label="Setlist"
            className="mb-8 rounded-xl border border-border-default bg-surface-raised p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
                  <ListMusic className="size-4" aria-hidden /> Setlist
                </h2>
                <p className="mt-1 text-xs text-text-secondary">
                  Songs the band may play. Final setlist confirmed after the show.
                </p>
              </div>
            </div>
          </section>
        )}

        <p className="mt-12 text-center text-xs text-text-muted">
          Powered by Tour Manager OS. <Link href="/" className="hover:text-text-secondary">Learn more</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}

function TimeRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-md border border-border-default bg-surface p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold ${highlight ? 'text-primary-700 dark:text-primary-400' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}
