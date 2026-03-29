import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { NewPostForm } from './new-post-form'

export const metadata: Metadata = { title: 'New Post', robots: { index: false } }

export default async function NewPostPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  // Get category ID from slug
  const { data: category } = await supabase
    .from('community_categories')
    .select('id, name')
    .eq('org_id', orgMembership.org_id)
    .eq('slug', categorySlug)
    .single()

  if (!category) return null

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={`/community/${categorySlug}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back to {category.name}</Link>
      <h1 className="mb-6 text-2xl font-bold">New Post</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <NewPostForm categoryId={category.id} categorySlug={categorySlug} />
      </div>
    </main>
  )
}
