import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Pin, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getCategoryWithPosts } from '@/lib/community/queries'

export const metadata: Metadata = {
  title: 'Discussion',
  robots: { index: false },
}

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  const { category, posts } = await getCategoryWithPosts(orgMembership.org_id, categorySlug)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/community" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; All Categories</Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && <p className="text-sm text-text-secondary">{category.description}</p>}
        </div>
        <Link
          href={`/community/${categorySlug}/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <MessageCircle className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No posts yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const replyCount = Array.isArray(post.community_replies) ? post.community_replies.length : 0
            const authorName = (post.user_profiles as { display_name: string | null })?.display_name || 'Unknown'
            return (
              <Link
                key={post.id}
                href={`/community/${categorySlug}/${post.id}`}
                className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-4 transition-all hover:border-primary-500/50 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {post.pinned && <Pin className="h-3 w-3 text-primary-600 dark:text-primary-400" aria-label="Pinned" />}
                    <h2 className="font-medium">{post.title}</h2>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {authorName} &bull; {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <MessageCircle className="h-3 w-3" aria-hidden="true" />
                  {replyCount}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
