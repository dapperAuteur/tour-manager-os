import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { SearchBar } from '@/components/ui/search-bar'
import { getAllFeedbackThreads } from '@/lib/feedback/queries'

export const metadata: Metadata = { title: 'Manage Feedback', robots: { index: false } }

const statusColors: Record<string, string> = {
  open: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  in_progress: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  resolved: 'bg-success-500/20 text-success-600 dark:text-success-500',
  closed: 'bg-text-muted/20 text-text-muted',
}

const priorityColors: Record<string, string> = {
  low: 'text-text-muted',
  normal: 'text-text-secondary',
  high: 'text-warning-600 dark:text-warning-500',
  urgent: 'text-error-500',
}

export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return <main id="main-content" className="mx-auto max-w-4xl px-4 py-8"><p className="text-text-secondary">Admin access required.</p></main>
  }

  const threads = await getAllFeedbackThreads(q)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Feedback</h1>
          <p className="text-sm text-text-secondary">{threads.length} thread{threads.length !== 1 ? 's' : ''}</p>
        </div>
        <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">Super Admin</span>
      </div>

      <SearchBar basePath="/admin/feedback" placeholder="Search feedback threads..." initialQuery={q} />

      {threads.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No feedback yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => {
            const userName = (thread.user_profiles as { display_name: string | null })?.display_name || 'Unknown'
            const msgCount = Array.isArray(thread.feedback_messages) ? thread.feedback_messages.length : 0
            return (
              <Link
                key={thread.id}
                href={`/admin/feedback/${thread.id}`}
                className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-4 transition-all hover:border-primary-500/50 hover:shadow-sm"
              >
                <div>
                  <h2 className="font-medium">{thread.subject}</h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                    <span className="font-medium text-text-secondary">{userName}</span>
                    <span className="capitalize">{thread.category}</span>
                    <span className={priorityColors[thread.priority]}>{thread.priority}</span>
                    <span>{msgCount} msg{msgCount !== 1 ? 's' : ''}</span>
                    <span>{new Date(thread.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[thread.status]}`}>
                  {thread.status.replace('_', ' ')}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
