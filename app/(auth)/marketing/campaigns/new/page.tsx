import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getEmailLists } from '@/lib/marketing/queries'
import { NewCampaignForm } from './new-campaign-form'

export const metadata: Metadata = { title: 'New Campaign', robots: { index: false } }

export default async function NewCampaignPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  const lists = await getEmailLists(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/marketing" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back to Marketing</Link>
      <h1 className="mb-6 text-2xl font-bold">Create Campaign</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <NewCampaignForm orgId={orgMembership.org_id} lists={lists} />
      </div>
    </main>
  )
}
