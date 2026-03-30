import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { NewBlogForm } from './new-blog-form'

export const metadata: Metadata = { title: 'New Blog Post', robots: { index: false } }

export default async function NewBlogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/blog" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back to Blog</Link>
      <h1 className="mb-6 text-2xl font-bold">New Blog Post</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <NewBlogForm orgId={orgMembership.org_id} />
      </div>
    </main>
  )
}
