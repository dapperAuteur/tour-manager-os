import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getBlogPosts } from '@/lib/blog/queries'

export const metadata: Metadata = { title: 'Blog', robots: { index: false } }

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="mx-auto max-w-4xl px-4 py-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const posts = await getBlogPosts(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Dashboard</Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Link href="/blog/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No blog posts yet. Write your first one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const authorName = post.user_profiles?.display_name || 'Unknown'
            const tags: string[] = Array.isArray(post.tags) ? post.tags : []

            return (
              <article key={post.id} className="rounded-xl border border-border-default bg-surface-raised p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{post.title}</h2>
                    {post.excerpt && (
                      <p className="mt-1 text-sm text-text-secondary">{post.excerpt}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                      <span>By {authorName}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    {tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-text-muted">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${post.published ? 'bg-success-500/20 text-success-600 dark:text-success-500' : 'bg-text-muted/20 text-text-muted'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
