import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { NewApiKeyForm } from './new-api-key-form'

export const metadata: Metadata = { title: 'New API Key', robots: { index: false } }

export default async function NewApiKeyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/admin/api-keys" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back</Link>
      <h1 className="mb-6 text-2xl font-bold">Create API Key</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <NewApiKeyForm orgId={orgMembership.org_id} />
      </div>
    </main>
  )
}
