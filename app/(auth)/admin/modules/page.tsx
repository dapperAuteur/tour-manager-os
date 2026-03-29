import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAllModules, getUserOrg } from '@/lib/modules/queries'
import { AdminModuleToggle } from './admin-module-toggle'

export const metadata: Metadata = {
  title: 'Manage Modules',
  robots: { index: false },
}

export default async function AdminModulesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership || !['owner', 'admin'].includes(orgMembership.role)) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-4 text-2xl font-bold">Manage Modules</h1>
        <p className="text-text-secondary">You don&apos;t have admin access to an organization.</p>
      </main>
    )
  }

  const orgId = orgMembership.org_id
  const allModules = await getAllModules()

  // Get current enabled state
  const { data: orgModules } = await supabase
    .from('org_modules')
    .select('module_id, enabled')
    .eq('org_id', orgId)

  const enabledMap = new Map(
    (orgModules || []).map((m) => [m.module_id, m.enabled])
  )

  // Get pending access requests
  const { data: requests } = await supabase
    .from('member_module_access')
    .select('*, user_profiles:member_id(display_name)')
    .eq('org_id', orgId)
    .eq('status', 'requested')

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Manage Modules</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Enable or disable modules for your organization. Members can activate enabled modules.
      </p>

      {/* Pending requests */}
      {requests && requests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Pending Requests ({requests.length})</h2>
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border border-warning-500/30 bg-warning-500/5 p-3">
                <div className="text-sm">
                  <span className="font-medium">
                    {(req.user_profiles as { display_name: string | null })?.display_name || 'Unknown'}
                  </span>
                  {' '}requested access to{' '}
                  <span className="font-medium">{req.module_id}</span>
                </div>
                <form>
                  <button
                    type="submit"
                    formAction={async () => {
                      'use server'
                      const { approveModuleRequest } = await import('@/lib/modules/actions')
                      await approveModuleRequest(req.member_id, orgId, req.module_id)
                    }}
                    className="rounded-lg bg-success-600 px-3 py-1 text-xs font-medium text-white hover:bg-success-600/90"
                  >
                    Approve
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module toggles */}
      <div className="space-y-3">
        {allModules.map((mod) => (
          <AdminModuleToggle
            key={mod.id}
            module={mod}
            orgId={orgId}
            enabled={enabledMap.get(mod.id) ?? false}
          />
        ))}
      </div>
    </main>
  )
}
