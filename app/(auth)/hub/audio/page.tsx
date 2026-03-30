import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Music, MessageSquare, Clock, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getSharedAudio } from '@/lib/audio/queries'

export const metadata: Metadata = { title: 'Shared Audio', robots: { index: false } }

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function AudioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="mx-auto max-w-4xl px-4 py-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const audioFiles = await getSharedAudio(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/hub" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Family Hub</Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shared Audio</h1>
        <Link href="/hub/audio/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> Upload Audio
        </Link>
      </div>

      {audioFiles.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Music className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No audio files shared yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {audioFiles.map((audio) => {
            const commentCount = Array.isArray(audio.audio_comments) ? audio.audio_comments[0]?.count ?? 0 : 0
            const uploaderName = audio.user_profiles?.display_name || 'Unknown'

            return (
              <div key={audio.id} className="rounded-xl border border-border-default bg-surface-raised p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{audio.title}</h3>
                    {audio.description && (
                      <p className="mt-1 text-sm text-text-secondary">{audio.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                      <span>By {uploaderName}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" /> {formatDuration(audio.duration_seconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" aria-hidden="true" /> {commentCount} comments
                      </span>
                    </div>
                  </div>
                  {audio.file_url && (
                    <a
                      href={audio.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-alt"
                      aria-label={`Open audio file: ${audio.title}`}
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" /> Open
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
