import type { Metadata } from 'next'
import Link from 'next/link'
import { getThreadWithMessages } from '@/lib/feedback/queries'
import { ReplyForm } from './reply-form'

export const metadata: Metadata = { title: 'Feedback Thread', robots: { index: false } }

const statusColors: Record<string, string> = {
  open: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  in_progress: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  resolved: 'bg-success-500/20 text-success-600 dark:text-success-500',
  closed: 'bg-text-muted/20 text-text-muted',
}

export default async function FeedbackThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params
  const { thread, messages } = await getThreadWithMessages(threadId)

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/feedback" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; All Feedback</Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{thread.subject}</h1>
          <p className="mt-1 text-xs text-text-muted capitalize">{thread.category} &bull; {thread.priority} priority</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[thread.status]}`}>
          {thread.status.replace('_', ' ')}
        </span>
      </div>

      {/* Messages */}
      <div className="mb-8 space-y-4">
        {messages.map((msg) => {
          const isAdmin = msg.sender_role === 'admin'
          const senderName = (msg.user_profiles as { display_name: string | null })?.display_name || (isAdmin ? 'Admin' : 'You')
          return (
            <div key={msg.id} className={`rounded-xl border p-4 ${isAdmin ? 'border-primary-500/30 bg-primary-500/5' : 'border-border-default bg-surface-raised'}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {senderName}
                  {isAdmin && <span className="ml-2 rounded-full bg-primary-500/20 px-2 py-0.5 text-xs text-primary-600 dark:text-primary-400">Admin</span>}
                </span>
                <span className="text-xs text-text-muted">
                  {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          )
        })}
      </div>

      {/* Reply */}
      {thread.status !== 'closed' && (
        <div className="rounded-xl border border-border-default bg-surface-raised p-6">
          <h2 className="mb-4 font-semibold">Reply</h2>
          <ReplyForm threadId={threadId} />
        </div>
      )}
    </main>
  )
}
