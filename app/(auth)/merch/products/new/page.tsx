import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { AddProductForm } from './add-product-form'

interface TourOption { id: string; name: string }

export const metadata: Metadata = {
  title: 'Add Product',
  robots: { index: false },
}

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return null

  const { data: toursRaw } = await supabase
    .from('tours')
    .select('id, name')
    .eq('org_id', orgMembership.org_id)
    .order('start_date', { ascending: false })
    .limit(40)
  const tours: TourOption[] = (toursRaw || []).map((t) => ({ id: t.id, name: t.name }))

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/merch" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">
        &larr; Back to Merch
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Add Product</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <AddProductForm orgId={orgMembership.org_id} tours={tours} />
      </div>
    </main>
  )
}
