import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import { createAdminClient } from '@/lib/supabase/admin'

interface PageProps {
  params: Promise<{ id: string }>
}

function ogImageUrl(url: string): string {
  return url.replace(
    '/upload/',
    '/upload/f_auto,q_auto,w_1200,h_630,c_fill,g_auto/',
  )
}

function fullImageUrl(url: string, width = 1600): string {
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width},c_limit/`,
  )
}

async function fetchPhoto(id: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('fan_photos')
    .select(
      `id, cloudinary_url, width, height, caption, submitted_at, status, show_id,
       shows(date, city, state, venue_name, tours(name, artist_name))`,
    )
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const photo = await fetchPhoto(id)
  if (!photo) return { title: 'Photo not found' }

  type EmbeddedTour = { name: string | null; artist_name: string | null }
  type EmbeddedShow = {
    date: string
    city: string
    state: string | null
    venue_name: string | null
    tours: EmbeddedTour | EmbeddedTour[] | null
  }
  const showRaw = photo.shows as EmbeddedShow | EmbeddedShow[] | null
  const show = Array.isArray(showRaw) ? showRaw[0] : showRaw
  const tour = show
    ? Array.isArray(show.tours) ? show.tours[0] : show.tours
    : null
  const artist = tour?.artist_name || tour?.name || 'A show'
  const venue =
    show?.venue_name ||
    (show ? `${show.city}${show.state ? ', ' + show.state : ''}` : '')
  const title = `${artist}${venue ? ` at ${venue}` : ''} — Fan Photo`
  const description = photo.caption || `A fan-shared photo from ${artist}.`
  const og = ogImageUrl(photo.cloudinary_url)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: og, width: 1200, height: 630, alt: description }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og],
    },
  }
}

export default async function PhotoSharePage({ params }: PageProps) {
  const { id } = await params
  const photo = await fetchPhoto(id)
  if (!photo) notFound()

  type EmbeddedTour = { name: string | null; artist_name: string | null }
  type EmbeddedShow = {
    date: string
    city: string
    state: string | null
    venue_name: string | null
    tours: EmbeddedTour | EmbeddedTour[] | null
  }
  const showRaw = photo.shows as EmbeddedShow | EmbeddedShow[] | null
  const show = Array.isArray(showRaw) ? showRaw[0] : showRaw
  const tour = show
    ? Array.isArray(show.tours) ? show.tours[0] : show.tours
    : null
  const artist = tour?.artist_name || tour?.name || 'Tour'
  const venue =
    show?.venue_name ||
    (show ? `${show.city}${show.state ? ', ' + show.state : ''}` : '')

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="overflow-hidden rounded-2xl bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullImageUrl(photo.cloudinary_url, 1600)}
            alt={photo.caption || 'Fan photo'}
            width={photo.width ?? undefined}
            height={photo.height ?? undefined}
            className="block h-auto w-full"
          />
        </div>

        <div className="mt-6">
          {photo.caption && (
            <p className="text-lg leading-relaxed">{photo.caption}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {artist}
            </span>
            {show && (
              <>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden /> {venue}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" aria-hidden />
                  <time dateTime={show.date}>
                    {new Date(show.date).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={`/shows/${photo.show_id}/photos`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            More from this show
          </Link>
          <Link
            href={`/shows/${photo.show_id}/tickets`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Ticket className="size-4" aria-hidden /> Get tickets for the next show
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
