import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { NewAlbumForm } from './new-album-form'

export const metadata: Metadata = { title: 'New Album', robots: { index: false } }

export default async function NewAlbumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  // Get tours for association
  const { data: tours } = await supabase.from('tours').select('id, name').order('created_at', { ascending: false })

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/hub/albums" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back to Albums</Link>
      <h1 className="mb-6 text-2xl font-bold">Create Album</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <NewAlbumForm orgId={orgMembership.org_id} tours={tours || []} />
      </div>
    </main>
  )
}
