import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { getAdminThreadWithMessages } from '@/lib/feedback/queries'
import { ReplyForm } from '@/app/(auth)/feedback/[threadId]/reply-form'
import { StatusControl } from './status-control'

export const metadata: Metadata = { title: 'Feedback Thread (Admin)', robots: { index: false } }

export default async function AdminFeedbackThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) return null

  const { thread, messages } = await getAdminThreadWithMessages(threadId)
  const userName = (thread.user_profiles as { display_name: string | null })?.display_name || 'Unknown User'

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/admin/feedback" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; All Feedback</Link>

      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{thread.subject}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-text-muted">
              <span>From: <span className="font-medium text-text-primary">{userName}</span></span>
              <span className="capitalize">{thread.category}</span>
              <span className="capitalize">{thread.priority} priority</span>
            </div>
          </div>
          <StatusControl threadId={threadId} currentStatus={thread.status} />
        </div>
      </div>

      {/* Messages */}
      <div className="mb-8 space-y-4">
        {messages.map((msg) => {
          const isAdmin = msg.sender_role === 'admin'
          const senderName = (msg.user_profiles as { display_name: string | null })?.display_name || (isAdmin ? 'Admin' : userName)
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

      {/* Admin reply */}
      {thread.status !== 'closed' && (
        <div className="rounded-xl border border-primary-500/30 bg-primary-500/5 p-6">
          <h2 className="mb-4 font-semibold">Reply as Admin</h2>
          <ReplyForm threadId={threadId} />
        </div>
      )}
    </main>
  )
}
