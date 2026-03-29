import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getMerchProducts } from '@/lib/merch/queries'
import { RecordSaleForm } from './record-sale-form'

export const metadata: Metadata = {
  title: 'Record Sale',
  robots: { index: false },
}

export default async function RecordSalePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  const products = await getMerchProducts(orgMembership.org_id)

  // Get shows from user's tours
  const { data: shows } = await supabase
    .from('shows')
    .select('id, date, city, state, venue_name, tour_id')
    .order('date', { ascending: false })
    .limit(50)

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/merch" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">
        &larr; Back to Merch
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Record Sale</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <RecordSaleForm products={products} shows={shows || []} />
      </div>
    </main>
  )
}
