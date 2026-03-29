import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, MessageSquare } from 'lucide-react'
import { getUserFeedbackThreads } from '@/lib/feedback/queries'
import { SearchBar } from '@/components/ui/search-bar'

export const metadata: Metadata = { title: 'Feedback', robots: { index: false } }

const statusColors: Record<string, string> = {
  open: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  in_progress: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  resolved: 'bg-success-500/20 text-success-600 dark:text-success-500',
  closed: 'bg-text-muted/20 text-text-muted',
}

const categoryLabels: Record<string, string> = {
  bug: 'Bug', feature: 'Feature Request', question: 'Question', praise: 'Praise', other: 'Other',
}

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const threads = await getUserFeedbackThreads(q)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feedback</h1>
          <p className="text-sm text-text-secondary">Send feedback, report bugs, or request features.</p>
        </div>
        <Link href="/feedback/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> New Feedback
        </Link>
      </div>

      <SearchBar basePath="/feedback" placeholder="Search feedback..." initialQuery={q} />

      {threads.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No feedback yet. We&apos;d love to hear from you!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => {
            const msgCount = Array.isArray(thread.feedback_messages) ? thread.feedback_messages.length : 0
            return (
              <Link
                key={thread.id}
                href={`/feedback/${thread.id}`}
                className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-4 transition-all hover:border-primary-500/50 hover:shadow-sm"
              >
                <div>
                  <h2 className="font-medium">{thread.subject}</h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                    <span>{categoryLabels[thread.category] || thread.category}</span>
                    <span>{new Date(thread.updated_at).toLocaleDateString()}</span>
                    <span>{msgCount} message{msgCount !== 1 ? 's' : ''}</span>
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
