import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { getUserOrg } from '@/lib/modules/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { BrandingForm } from './branding-form'
import { DomainsSection } from './domains-section'

export const metadata: Metadata = { title: 'White Label', robots: { index: false } }

export default async function WhiteLabelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const superAdmin = isSuperAdmin(user.email)
  const orgMembership = await getUserOrg(user.id)
  let orgId = orgMembership?.org_id

  if (!orgId && superAdmin) {
    const adminClient = createAdminClient()
    const { data: firstOrg } = await adminClient.from('organizations').select('id').limit(1).single()
    orgId = firstOrg?.id
  }

  if (!orgId) {
    return <main id="main-content" className="p-8"><p className="text-text-secondary">No organization found.</p></main>
  }

  // Get org branding data
  const client = superAdmin ? createAdminClient() : supabase
  const { data: org } = await client.from('organizations').select('*').eq('id', orgId).single()
  const { data: domains } = await client.from('custom_domains').select('*').eq('org_id', orgId)

  if (!org) return null

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">White Label</h1>
          <p className="text-sm text-text-secondary">Customize branding, colors, and domain for your organization. Requires enterprise subscription.</p>
        </div>
        {superAdmin && <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">Super Admin</span>}
      </div>

      {/* Branding */}
      <section className="mb-10" aria-labelledby="branding-heading">
        <h2 id="branding-heading" className="mb-4 text-lg font-semibold">Branding</h2>
        <div className="rounded-xl border border-border-default bg-surface-raised p-6">
          <BrandingForm orgId={orgId} org={org} />
        </div>
      </section>

      {/* Custom Domains */}
      <section aria-labelledby="domains-heading">
        <h2 id="domains-heading" className="mb-4 text-lg font-semibold">Custom Domains</h2>
        <DomainsSection orgId={orgId} domains={domains || []} />
      </section>
    </main>
  )
}
