import type { Metadata } from 'next'
import Link from 'next/link'
import { Pin } from 'lucide-react'
import { getPostWithReplies } from '@/lib/community/queries'
import { ReplyForm } from './reply-form'

export const metadata: Metadata = { title: 'Post', robots: { index: false } }

export default async function PostPage({ params }: { params: Promise<{ categorySlug: string; postId: string }> }) {
  const { categorySlug, postId } = await params
  const { post, replies } = await getPostWithReplies(postId)

  const authorName = (post.user_profiles as { display_name: string | null })?.display_name || 'Unknown'

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href={`/community/${categorySlug}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back</Link>

      {/* Post */}
      <article className="mb-8 rounded-xl border border-border-default bg-surface-raised p-6">
        <div className="mb-4 flex items-center gap-2">
          {post.pinned && <Pin className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-label="Pinned" />}
          <h1 className="text-xl font-bold">{post.title}</h1>
        </div>
        <p className="mb-4 whitespace-pre-wrap text-sm">{post.content}</p>
        <p className="text-xs text-text-muted">
          {authorName} &bull; {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </p>
      </article>

      {/* Replies */}
      <h2 className="mb-4 text-lg font-semibold">Replies ({replies.length})</h2>

      {replies.length > 0 && (
        <div className="mb-8 space-y-3">
          {replies.map((reply) => {
            const replyAuthor = (reply.user_profiles as { display_name: string | null })?.display_name || 'Unknown'
            return (
              <div key={reply.id} className="rounded-lg border border-border-default bg-surface-raised p-4">
                <p className="mb-2 whitespace-pre-wrap text-sm">{reply.content}</p>
                <p className="text-xs text-text-muted">
                  {replyAuthor} &bull; {new Date(reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Reply form */}
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <h3 className="mb-4 font-semibold">Reply</h3>
        <ReplyForm postId={postId} categorySlug={categorySlug} />
      </div>
    </main>
  )
}
