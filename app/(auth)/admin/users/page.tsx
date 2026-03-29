import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { getAdminUsers } from '@/lib/admin/queries'
import { Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Manage Users', robots: { index: false } }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return <main id="main-content" className="mx-auto max-w-4xl px-4 py-8"><p className="text-text-secondary">Admin access required.</p></main>
  }

  const users = await getAdminUsers()

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-text-secondary">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">Super Admin</span>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No users yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs text-text-muted">
                <th className="pb-3 pr-4" scope="col">User</th>
                <th className="pb-3 pr-4" scope="col">Email</th>
                <th className="pb-3 pr-4" scope="col">Organization</th>
                <th className="pb-3 pr-4" scope="col">Role</th>
                <th className="pb-3 pr-4" scope="col">Paid</th>
                <th className="pb-3 pr-4" scope="col">Joined</th>
                <th className="pb-3" scope="col">Last Sign In</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const orgName = (u.orgMembership?.organizations as { name: string } | null)?.name
                const orgRole = u.orgMembership?.role
                const isPaid = u.orgMembership?.is_paid

                return (
                  <tr key={u.id} className="border-b border-border-default">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                          {(u.profile?.display_name || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.profile?.display_name || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{u.email}</td>
                    <td className="py-3 pr-4">{orgName || <span className="text-text-muted">—</span>}</td>
                    <td className="py-3 pr-4 capitalize">{orgRole || <span className="text-text-muted">—</span>}</td>
                    <td className="py-3 pr-4">
                      {isPaid !== undefined ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isPaid ? 'bg-success-500/20 text-success-600 dark:text-success-500' : 'bg-text-muted/20 text-text-muted'}`}>
                          {isPaid ? 'Paid' : 'Free'}
                        </span>
                      ) : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-text-muted">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 text-text-muted">
                      {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
