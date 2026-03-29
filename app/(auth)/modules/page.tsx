import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAllModules, getUserOrg, getOrgModules, getMemberModuleAccess } from '@/lib/modules/queries'
import { ModuleCard } from './module-card'
import { SetupOrgBanner } from './setup-org-banner'

export const metadata: Metadata = {
  title: 'Modules',
  robots: { index: false },
}

export default async function ModulesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const allModules = await getAllModules()
  const orgMembership = await getUserOrg(user.id)

  if (!orgMembership) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">Modules</h1>
        <SetupOrgBanner />
      </main>
    )
  }

  const orgId = orgMembership.org_id
  const enabledModules = await getOrgModules(orgId)
  const memberAccess = await getMemberModuleAccess(user.id, orgId)

  const enabledModuleIds = new Set(enabledModules.map((m) => m.module_id))
  const accessMap = new Map(memberAccess.map((a) => [a.module_id, a.status]))

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Modules</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Browse available features. Activate the ones you need.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allModules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            orgId={orgId}
            enabled={enabledModuleIds.has(mod.id)}
            accessStatus={accessMap.get(mod.id) || null}
          />
        ))}
      </div>
    </main>
  )
}
