'use client'

import { useState } from 'react'
import { Clock, Star, Trash2, MessageSquare } from 'lucide-react'
import { addSong, deleteSetlistSong, addSetlistComment } from '@/lib/setlist/actions'

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface SetlistDetailProps {
  setlist: {
    id: string
    name: string
    setlist_songs: {
      id: string
      title: string
      duration_seconds: number | null
      key: string | null
      tempo: number | null
      notes: string | null
      is_encore: boolean
      sort_order: number
    }[]
    setlist_comments: {
      id: string
      content: string
      created_at: string
      user_profiles: { display_name: string } | null
    }[]
  }
  tourId: string
}

export function SetlistDetail({ setlist, tourId }: SetlistDetailProps) {
  const [songError, setSongError] = useState('')
  const [songLoading, setSongLoading] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  async function handleAddSong(formData: FormData) {
    setSongError('')
    setSongLoading(true)
    const result = await addSong(setlist.id, tourId, formData)
    if (result?.error) { setSongError(result.error) }
    setSongLoading(false)
  }

  async function handleDeleteSong(songId: string) {
    await deleteSetlistSong(songId, tourId)
  }

  async function handleAddComment(formData: FormData) {
    setCommentError('')
    setCommentLoading(true)
    const result = await addSetlistComment(setlist.id, tourId, formData)
    if (result?.error) { setCommentError(result.error) }
    setCommentLoading(false)
  }

  const songs = setlist.setlist_songs || []
  const comments = setlist.setlist_comments || []

  return (
    <div className="mt-2 rounded-xl border border-border-default bg-surface-raised p-5">
      {/* Songs */}
      <h3 className="mb-3 text-sm font-semibold uppercase text-text-muted">Songs ({songs.length})</h3>

      {songs.length > 0 ? (
        <div className="mb-4 divide-y divide-border-default rounded-lg border border-border-default">
          {songs.map((song, idx) => (
            <div key={song.id} className={`flex items-center justify-between px-4 py-3 ${song.is_encore ? 'bg-warning-500/5' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-alt text-xs font-medium text-text-muted">{idx + 1}</span>
                <div>
                  <p className="text-sm font-medium">
                    {song.title}
                    {song.is_encore && (
                      <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-warning-500/20 px-2 py-0.5 text-xs font-medium text-warning-600 dark:text-warning-500">
                        <Star className="h-3 w-3" aria-hidden="true" /> Encore
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" /> {formatDuration(song.duration_seconds)}</span>
                    {song.key && <span>Key: {song.key}</span>}
                    {song.tempo && <span>{song.tempo} BPM</span>}
                  </div>
                  {song.notes && <p className="mt-1 text-xs text-text-muted italic">{song.notes}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteSong(song.id)}
                className="rounded-lg p-2 text-text-muted hover:bg-surface-alt hover:text-error-500"
                aria-label={`Remove ${song.title}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-sm text-text-muted">No songs added yet.</p>
      )}

      {/* Add song form */}
      <div className="mb-6 rounded-lg border border-border-default bg-surface-alt p-4">
        <h4 className="mb-3 text-sm font-medium">Add Song</h4>
        {songError && <div role="alert" className="mb-3 rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{songError}</div>}
        <form action={handleAddSong} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="song-title" className="mb-1 block text-xs font-medium">Title <span className="text-error-500">*</span></label>
            <input id="song-title" name="title" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
          </div>
          <div>
            <label htmlFor="song-duration" className="mb-1 block text-xs font-medium">Duration (seconds)</label>
            <input id="song-duration" name="duration_seconds" type="number" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
          </div>
          <div>
            <label htmlFor="song-key" className="mb-1 block text-xs font-medium">Key</label>
            <input id="song-key" name="key" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="C, Am, G..." />
          </div>
          <div>
            <label htmlFor="song-tempo" className="mb-1 block text-xs font-medium">Tempo (BPM)</label>
            <input id="song-tempo" name="tempo" type="number" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
          </div>
          <div>
            <label htmlFor="song-sort" className="mb-1 block text-xs font-medium">Sort Order</label>
            <input id="song-sort" name="sort_order" type="number" defaultValue={songs.length} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="song-notes" className="mb-1 block text-xs font-medium">Notes</label>
            <input id="song-notes" name="notes" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_encore" className="rounded accent-primary-600" />
            Encore
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={songLoading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{songLoading ? 'Adding...' : 'Add Song'}</button>
          </div>
        </form>
      </div>

      {/* Comments */}
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-text-muted">
        <MessageSquare className="h-4 w-4" aria-hidden="true" /> Comments ({comments.length})
      </h3>

      {comments.length > 0 && (
        <div className="mb-4 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-border-default bg-surface-alt px-4 py-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-text-muted">
                <span className="font-medium text-text-secondary">{comment.user_profiles?.display_name || 'Unknown'}</span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {commentError && <div role="alert" className="mb-3 rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{commentError}</div>}
      <form action={handleAddComment} className="flex gap-2">
        <label htmlFor="comment-content" className="sr-only">Add a comment</label>
        <input id="comment-content" name="content" type="text" required placeholder="Add a comment..." className="flex-1 rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        <button type="submit" disabled={commentLoading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{commentLoading ? 'Posting...' : 'Post'}</button>
      </form>
    </div>
  )
}
