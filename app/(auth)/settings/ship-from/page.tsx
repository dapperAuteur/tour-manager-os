import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ShipFromForm } from './ship-from-form'

export const metadata: Metadata = {
  title: 'Ship-From Address',
  robots: { index: false },
}

export default async function ShipFromPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .limit(1)
    .maybeSingle()

  if (!membership?.org_id) {
    return (
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-sm text-text-secondary">
          Org owner or admin only.
        </p>
      </main>
    )
  }

  const { data: org } = await supabase
    .from('organizations')
    .select(
      'id, name, ship_from_name, ship_from_line1, ship_from_line2, ship_from_city, ship_from_state, ship_from_postal_code, ship_from_country, ship_from_phone',
    )
    .eq('id', membership.org_id)
    .maybeSingle()

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/settings"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Settings
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Package className="size-5" aria-hidden /> Ship-From Address
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Where your merch ships from. Shippo uses this to quote
          real-time rates at fan checkout. International rates depend
          heavily on origin country, so keep this accurate.
        </p>
      </header>
      <ShipFromForm initial={org || {}} />
    </main>
  )
}
