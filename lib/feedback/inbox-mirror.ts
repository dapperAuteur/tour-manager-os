import { sendToInbox } from '@/lib/inbox-sender'

/**
 * Mirror an in-app feedback submission into the WitUS Inbox so BAM triages
 * every product's help/feedback/bug reports from one place
 * (inbox.witus.online → Triage agent). Supabase `feedback_threads` stays the
 * system of record; this is a non-blocking side-channel. Never throws — a
 * down/unconfigured Inbox must not break the user's submission.
 *
 * Call via `after()` (next/server) so it runs after the response is sent.
 */

// feedback_threads.category → Inbox form_type (aligns with the Triage agent's
// category taxonomy: bug_report / feature_request / support_question).
const FORM_TYPE_BY_CATEGORY: Record<string, string> = {
  bug: 'tour-bug-report',
  feature: 'tour-feature-request',
  question: 'tour-support-question',
  praise: 'tour-praise',
  other: 'tour-feedback',
}

interface MirrorArgs {
  category: string
  subject: string
  content: string
  threadId: string
  /** A brand-new thread, or a follow-up reply on an existing one. */
  kind?: 'new' | 'reply'
  submitterEmail?: string | null
  submitterName?: string | null
}

export async function mirrorFeedbackToInbox(args: MirrorArgs): Promise<void> {
  const inboxUrl = process.env.INBOX_INGEST_URL
  const sourceSlug = process.env.INBOX_SOURCE_SLUG
  const hmacSecret = process.env.INBOX_INGEST_SECRET

  // Side-channel mirror, not the system of record. If it isn't configured
  // (local dev, preview without secrets) skip silently.
  if (!inboxUrl || !sourceSlug || !hmacSecret) return

  const formType = FORM_TYPE_BY_CATEGORY[args.category] ?? 'tour-feedback'

  try {
    const result = await sendToInbox({
      inboxUrl,
      sourceSlug,
      hmacSecret,
      submission: {
        form_type: formType,
        // Bugs ride the high-priority lane so Triage can SMS-escalate.
        priority: args.category === 'bug' ? 'high' : 'normal',
        ...(args.submitterEmail ? { submitter_email: args.submitterEmail } : {}),
        ...(args.submitterName ? { submitter_name: args.submitterName } : {}),
        payload: {
          kind: args.kind ?? 'new',
          category: args.category,
          subject: args.subject,
          content: args.content,
          thread_id: args.threadId,
          app: 'tour-witus',
          url: `https://tour.witus.online/feedback/${args.threadId}`,
        },
      },
    })
    if (!result.ok) {
      // Log only non-sensitive routing fields — never body/secret/signature.
      console.error('[inbox-mirror] failed', {
        source: sourceSlug,
        form_type: formType,
        http_status: result.status,
      })
    }
  } catch (err) {
    console.error('[inbox-mirror] error', {
      source: sourceSlug,
      form_type: formType,
      err: err instanceof Error ? err.name : 'UnknownError',
    })
  }
}
