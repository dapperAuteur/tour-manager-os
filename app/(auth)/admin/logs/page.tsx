import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { getActivityLogs } from '@/lib/admin/queries'
import { ScrollText } from 'lucide-react'

export const metadata: Metadata = { title: 'Activity Logs', robots: { index: false } }

export default async function AdminLogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return <main id="main-content" className="mx-auto max-w-4xl px-4 py-8"><p className="text-text-secondary">Admin access required.</p></main>
  }

  const logs = await getActivityLogs()

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Logs</h1>
          <p className="text-sm text-text-secondary">Recent platform activity.</p>
        </div>
        <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">Super Admin</span>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <ScrollText className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No activity logged yet. Logs will appear as users interact with the platform.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs text-text-muted">
                <th className="pb-3 pr-4" scope="col">Time</th>
                <th className="pb-3 pr-4" scope="col">User</th>
                <th className="pb-3 pr-4" scope="col">Action</th>
                <th className="pb-3 pr-4" scope="col">Resource</th>
                <th className="pb-3" scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border-default">
                  <td className="py-3 pr-4 text-text-muted">
                    {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </td>
                  <td className="py-3 pr-4">{log.user_email || log.user_id?.slice(0, 8) || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded bg-surface-alt px-2 py-0.5 text-xs font-medium">{log.action}</span>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {log.resource_type ? `${log.resource_type}${log.resource_id ? ` #${log.resource_id.slice(0, 8)}` : ''}` : '—'}
                  </td>
                  <td className="py-3 text-xs text-text-muted">
                    {log.metadata && Object.keys(log.metadata as Record<string, unknown>).length > 0
                      ? JSON.stringify(log.metadata).slice(0, 80)
                      : '—'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
