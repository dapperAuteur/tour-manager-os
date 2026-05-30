import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Camera, MapPin } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { PhotoGrid } from './photo-grid'
import { UploadPanel } from './upload-panel'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: 'Fan Photos',
    description: 'Photos from the show shared by ticket-holders.',
    openGraph: {
      title: 'Fan Photos — Tour Manager OS',
      description: 'Photos from the show shared by ticket-holders.',
    },
    alternates: { canonical: `/shows/${id}/photos` },
  }
}

export default async function ShowPhotosPage({ params }: PageProps) {
  const { id: showId } = await params

  const admin = createAdminClient()
  const { data: show } = await admin
    .from('shows')
    .select('id, date, city, state, venue_name, tour_id, tours(name, artist_name)')
    .eq('id', showId)
    .maybeSingle()

  if (!show) notFound()

  const { data: photos } = await admin
    .from('fan_photos')
    .select('id, cloudinary_url, width, height, caption, submitted_at, user_id')
    .eq('show_id', showId)
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false })
    .limit(60)

  // Determine viewer eligibility for the upload panel.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let canUpload = false
  if (user) {
    const { data: eligible } = await admin.rpc('can_post_photos_for_show', {
      _uid: user.id,
      _show_id: showId,
    })
    canUpload = Boolean(eligible)
  }

  type EmbeddedTour = { name: string | null; artist_name: string | null }
  const tours = show.tours as EmbeddedTour | EmbeddedTour[] | null
  const tour = Array.isArray(tours) ? tours[0] : tours
  const artist = tour?.artist_name || tour?.name || 'Tour'
  const venue =
    show.venue_name ||
    `${show.city}${show.state ? ', ' + show.state : ''}`

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <Camera className="size-4" aria-hidden /> Fan Photos
          </div>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{artist}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" aria-hidden />
              <time dateTime={show.date}>
                {new Date(show.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden /> {venue}
            </div>
          </div>
        </div>

        <UploadPanel
          showId={showId}
          isAuthed={Boolean(user)}
          canUpload={canUpload}
        />

        {photos && photos.length > 0 ? (
          <PhotoGrid photos={photos} />
        ) : (
          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <p className="font-medium">No fan photos yet.</p>
            <p className="mt-1 text-sm">
              Be the first — ticket-holders can share their shots above.
            </p>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
          <Link href={`/shows/${showId}/tickets`} className="underline">
            Get tickets for an upcoming show
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
