import type { Metadata } from 'next'
import Link from 'next/link'
import { Music, MessageSquare } from 'lucide-react'
import { getSetlistsForTour, getSetlistWithSongs } from '@/lib/setlist/queries'
import { getTour } from '@/lib/tours/queries'
import { SetlistDetail } from './setlist-detail'
import { NewSetlistForm } from './new-setlist-form'

export const metadata: Metadata = { title: 'Setlists', robots: { index: false } }

export default async function SetlistPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ setlist?: string }> }) {
  const { id: tourId } = await params
  const { setlist: activeSetlistId } = await searchParams
  const tour = await getTour(tourId)
  const setlists = await getSetlistsForTour(tourId)

  const activeSetlist = activeSetlistId
    ? await getSetlistWithSongs(activeSetlistId)
    : null

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={`/tours/${tourId}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back to Tour</Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Setlists</h1>
          <p className="text-text-secondary">{tour.name}</p>
        </div>
      </div>

      {/* Create new setlist */}
      <div className="mb-8 rounded-xl border border-border-default bg-surface-raised p-6">
        <h2 className="mb-4 text-lg font-semibold">Create New Setlist</h2>
        <NewSetlistForm tourId={tourId} />
      </div>

      {/* Setlist list */}
      {setlists.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Music className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No setlists yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {setlists.map((setlist) => {
            const songCount = Array.isArray(setlist.setlist_songs) ? setlist.setlist_songs[0]?.count ?? 0 : 0
            const commentCount = Array.isArray(setlist.setlist_comments) ? setlist.setlist_comments[0]?.count ?? 0 : 0

            return (
              <div key={setlist.id}>
                <Link
                  href={`/tours/${tourId}/setlist?setlist=${setlist.id}`}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-surface-alt ${activeSetlistId === setlist.id ? 'border-primary-500 bg-surface-alt' : 'border-border-default bg-surface-raised'}`}
                >
                  <div>
                    <h3 className="font-medium">{setlist.name}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Music className="h-3 w-3" aria-hidden="true" /> {songCount} songs
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" aria-hidden="true" /> {commentCount} comments
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted">{new Date(setlist.created_at).toLocaleDateString()}</span>
                </Link>

                {/* Active setlist detail */}
                {activeSetlistId === setlist.id && activeSetlist && (
                  <SetlistDetail setlist={activeSetlist} tourId={tourId} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
