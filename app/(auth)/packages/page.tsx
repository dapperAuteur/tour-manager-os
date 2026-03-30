import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Users, Calendar, Music } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getTourPackages } from '@/lib/packages/queries'

export const metadata: Metadata = { title: 'Tour Packages', robots: { index: false } }

const typeLabels: Record<string, string> = { tour: 'Tour Package', festival: 'Festival', residency: 'Residency' }
const statusColors: Record<string, string> = {
  draft: 'bg-text-muted/20 text-text-muted',
  active: 'bg-success-500/20 text-success-600 dark:text-success-500',
  completed: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  cancelled: 'bg-error-500/20 text-error-500',
}

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="p-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const packages = await getTourPackages(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tour Packages</h1>
          <p className="mt-1 text-sm text-text-secondary">Multi-act tours, festivals, and residencies.</p>
        </div>
        <Link href="/packages/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> New Package
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Music className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No tour packages yet. Create one to coordinate multiple acts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => {
            const actCount = Array.isArray(pkg.package_acts) ? pkg.package_acts.length : 0
            return (
              <Link key={pkg.id} href={`/packages/${pkg.id}`} className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-5 transition-all hover:border-primary-500/50 hover:shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{pkg.name}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[pkg.status]}`}>{pkg.status}</span>
                  </div>
                  {pkg.description && <p className="mt-1 text-sm text-text-secondary">{pkg.description}</p>}
                  <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                    <span>{typeLabels[pkg.package_type] || pkg.package_type}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" aria-hidden="true" />{actCount} act{actCount !== 1 ? 's' : ''}</span>
                    {pkg.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" aria-hidden="true" />{new Date(pkg.start_date).toLocaleDateString()}</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
