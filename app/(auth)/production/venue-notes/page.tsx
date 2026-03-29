import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, StickyNote } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getVenueNotes } from '@/lib/production/queries'
import { SearchBar } from '@/components/ui/search-bar'

export const metadata: Metadata = { title: 'Venue Notes', robots: { index: false } }

const categoryColors: Record<string, string> = {
  load_in: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  parking: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  stage: 'bg-success-500/20 text-success-600 dark:text-success-500',
  sound: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  catering: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  dressing_room: 'bg-text-muted/20 text-text-muted',
  security: 'bg-error-500/20 text-error-500',
  general: 'bg-surface-alt text-text-muted',
}

export default async function VenueNotesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="p-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const notes = await getVenueNotes(orgMembership.org_id, q)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/production" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Production Bible</Link>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Venue Notes</h1>
        <Link href="/production/venue-notes/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add Note
        </Link>
      </div>

      <SearchBar basePath="/production/venue-notes" placeholder="Search venues..." initialQuery={q} />

      {notes.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <StickyNote className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">
            {q ? `No notes matching "${q}".` : 'No venue notes yet. Add notes to remember for return engagements.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const authorName = (note.user_profiles as { display_name: string | null })?.display_name
            return (
              <div key={note.id} className="rounded-xl border border-border-default bg-surface-raised p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold">{note.venue_name}</h2>
                    <p className="text-xs text-text-muted">
                      {note.city}{note.state ? `, ${note.state}` : ''}
                      {authorName && <> &bull; {authorName}</>}
                      {' '}&bull; {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  {note.category && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${categoryColors[note.category] || categoryColors.general}`}>
                      {note.category.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-text-secondary">{note.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
