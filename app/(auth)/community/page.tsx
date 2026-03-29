import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getCommunityCategories } from '@/lib/community/queries'
import { CreateCategoryForm } from './create-category-form'

export const metadata: Metadata = {
  title: 'Community',
  robots: { index: false },
}

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-4 text-2xl font-bold">Community</h1>
        <p className="text-text-secondary">Create an organization first.</p>
      </main>
    )
  }

  const categories = await getCommunityCategories(orgMembership.org_id)
  const isAdmin = ['owner', 'admin'].includes(orgMembership.role)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-sm text-text-secondary">Discussions, announcements, and conversations.</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <MessageCircle className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="mb-4 text-sm text-text-secondary">No discussion categories yet.</p>
          {isAdmin && <CreateCategoryForm orgId={orgMembership.org_id} />}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {categories.map((cat) => {
              const postCount = Array.isArray(cat.community_posts) ? cat.community_posts.length : 0
              return (
                <Link
                  key={cat.id}
                  href={`/community/${cat.slug}`}
                  className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-5 transition-all hover:border-primary-500/50 hover:shadow-sm"
                >
                  <div>
                    <h2 className="font-semibold">{cat.name}</h2>
                    {cat.description && <p className="mt-1 text-sm text-text-secondary">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {postCount}
                  </div>
                </Link>
              )
            })}
          </div>

          {isAdmin && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">Add Category</h2>
              <div className="rounded-xl border border-border-default bg-surface-raised p-6">
                <CreateCategoryForm orgId={orgMembership.org_id} />
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
