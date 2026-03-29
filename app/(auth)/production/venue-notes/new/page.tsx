import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { AddVenueNoteForm } from './add-venue-note-form'

export const metadata: Metadata = { title: 'Add Venue Note', robots: { index: false } }

export default async function NewVenueNotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/production/venue-notes" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back</Link>
      <h1 className="mb-6 text-2xl font-bold">Add Venue Note</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <AddVenueNoteForm orgId={orgMembership.org_id} />
      </div>
    </main>
  )
}
