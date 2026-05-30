import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Camera, CheckCircle2, Clock, MapPin, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'My Photos',
}

interface PhotoRow {
  id: string
  show_id: string
  cloudinary_url: string
  width: number | null
  height: number | null
  caption: string | null
  status: string
  submitted_at: string
  moderated_at: string | null
  rejection_reason: string | null
  shows:
    | {
        date: string
        city: string
        state: string | null
        venue_name: string | null
        tours:
          | { artist_name: string | null; name: string | null }
          | { artist_name: string | null; name: string | null }[]
          | null
      }
    | {
        date: string
        city: string
        state: string | null
        venue_name: string | null
        tours:
          | { artist_name: string | null; name: string | null }
          | { artist_name: string | null; name: string | null }[]
          | null
      }[]
    | null
}

function thumbUrl(url: string, width = 400): string {
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width},c_limit/`,
  )
}

const STATUS_META: Record<
  string,
  { label: string; tone: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  approved: {
    label: 'Approved',
    tone: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
    Icon: CheckCircle2,
  },
  pending: {
    label: 'In review',
    tone:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
    Icon: Clock,
  },
  rejected: {
    label: 'Not approved',
    tone: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
    Icon: XCircle,
  },
  removed: {
    label: 'Removed',
    tone: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    Icon: XCircle,
  },
}

export default async function MyPhotosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/photos')

  const { data: photos } = await supabase
    .from('fan_photos')
    .select(
      `id, show_id, cloudinary_url, width, height, caption, status,
       submitted_at, moderated_at, rejection_reason,
       shows(date, city, state, venue_name, tours(artist_name, name))`,
    )
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(100)

  const rows = (photos || []) as unknown as PhotoRow[]

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-sm uppercase tracking-wide text-text-muted">
        <Camera className="size-4" aria-hidden /> My Photos
      </div>
      <h1 className="text-2xl font-bold sm:text-3xl">Your show photos</h1>
      <p className="mt-2 text-sm text-text-muted">
        Approved photos appear on each show&apos;s public wall.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border-default bg-surface-raised p-8 text-center">
          <p className="font-medium">No photos yet.</p>
          <p className="mt-1 text-sm text-text-muted">
            After you buy a ticket, head to that show&apos;s photo wall and share
            your shots.
          </p>
        </div>
      ) : (
        <ul role="list" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => {
            const meta = STATUS_META[p.status] || STATUS_META.pending
            const show = Array.isArray(p.shows) ? p.shows[0] : p.shows
            const tour = show
              ? Array.isArray(show.tours) ? show.tours[0] : show.tours
              : null
            const artist = tour?.artist_name || tour?.name || 'Show'
            const venue =
              show?.venue_name ||
              (show ? `${show.city}${show.state ? ', ' + show.state : ''}` : '')

            return (
              <li
                key={p.id}
                className="overflow-hidden rounded-2xl border border-border-default bg-surface-raised"
              >
                <div className="relative aspect-square bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl(p.cloudinary_url, 600)}
                    alt={p.caption || `Photo from ${artist}`}
                    width={p.width ?? undefined}
                    height={p.height ?? undefined}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.tone}`}
                  >
                    <meta.Icon className="size-3" aria-hidden /> {meta.label}
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-semibold">{artist}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted">
                    {venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" aria-hidden /> {venue}
                      </span>
                    )}
                    {show && (
                      <time dateTime={show.date}>
                        {new Date(show.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                  </div>
                  {p.caption && (
                    <p className="mt-2 line-clamp-2 text-sm">{p.caption}</p>
                  )}
                  {p.status === 'rejected' && p.rejection_reason && (
                    <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                      <span className="font-semibold uppercase tracking-wide">
                        Reason
                      </span>
                      <p className="mt-0.5">{p.rejection_reason}</p>
                    </div>
                  )}
                  {p.status === 'approved' && (
                    <Link
                      href={`/photos/${p.id}`}
                      className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      View public page →
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
