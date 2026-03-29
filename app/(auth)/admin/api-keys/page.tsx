import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Key, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { getUserOrg } from '@/lib/modules/queries'

export const metadata: Metadata = { title: 'API Keys', robots: { index: false } }

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const superAdmin = isSuperAdmin(user.email)
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership && !superAdmin) {
    return <main id="main-content" className="p-8"><p className="text-text-secondary">Admin access required.</p></main>
  }

  const orgId = orgMembership?.org_id
  const { data: keys } = orgId
    ? await supabase.from('api_keys').select('*').eq('org_id', orgId).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-sm text-text-secondary">Manage API keys for third-party integrations. API access requires a paid subscription.</p>
        </div>
        <Link href="/admin/api-keys/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> New Key
        </Link>
      </div>

      {!keys || keys.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Key className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No API keys yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k.id} className="rounded-xl border border-border-default bg-surface-raised p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{k.name}</h3>
                    <code className="rounded bg-surface-alt px-2 py-0.5 text-xs text-text-muted">{k.key_prefix}...</code>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${k.active ? 'bg-success-500/20 text-success-600 dark:text-success-500' : 'bg-text-muted/20 text-text-muted'}`}>
                      {k.active ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                    <span>Scopes: {(k.scopes as string[]).join(', ')}</span>
                    {k.last_used_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        Last used {new Date(k.last_used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
