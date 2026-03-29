import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getSharedAlbums } from '@/lib/hub/queries'

export const metadata: Metadata = { title: 'Albums', robots: { index: false } }

export default async function AlbumsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="mx-auto max-w-4xl px-4 py-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const albums = await getSharedAlbums(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/hub" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Family Hub</Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shared Albums</h1>
        <Link href="/hub/albums/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> New Album
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <ImageIcon className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No shared albums yet. Create one to share photos and videos from tours.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => {
            const mediaCount = Array.isArray(album.album_media) ? album.album_media.length : 0
            const tourName = (album.tours as { name: string } | null)?.name
            return (
              <Link
                key={album.id}
                href={`/hub/albums/${album.id}`}
                className="group rounded-xl border border-border-default bg-surface-raised p-5 transition-all hover:border-primary-500/50 hover:shadow-sm"
              >
                <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-surface-alt">
                  <ImageIcon className="h-12 w-12 text-text-muted" aria-hidden="true" />
                </div>
                <h2 className="font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400">{album.title}</h2>
                {album.description && <p className="mt-1 text-sm text-text-secondary">{album.description}</p>}
                <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                  <span>{mediaCount} item{mediaCount !== 1 ? 's' : ''}</span>
                  {tourName && <span>&bull; {tourName}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
