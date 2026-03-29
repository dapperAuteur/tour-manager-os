import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { NewInputListForm } from './new-input-list-form'

export const metadata: Metadata = { title: 'New Input List', robots: { index: false } }

export default async function NewInputListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/production/input-lists" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back</Link>
      <h1 className="mb-6 text-2xl font-bold">New Input List</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <NewInputListForm orgId={orgMembership.org_id} />
      </div>
    </main>
  )
}
