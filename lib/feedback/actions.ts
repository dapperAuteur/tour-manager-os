'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { mirrorFeedbackToInbox } from '@/lib/feedback/inbox-mirror'

/** Best-effort human name from Supabase user metadata, for the Inbox mirror. */
function displayNameOf(user: { user_metadata?: Record<string, unknown> }): string | null {
  const m = user.user_metadata ?? {}
  const n = m.display_name ?? m.full_name ?? m.name
  return typeof n === 'string' && n.trim() ? n : null
}

export async function createFeedbackThread(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const subject = formData.get('subject') as string
  const category = formData.get('category') as string
  const content = formData.get('content') as string
  const priority = formData.get('priority') as string

  if (!subject || !content || !category) return { error: 'Subject, category, and message are required' }

  // Get user's org
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const { data: thread, error } = await supabase
    .from('feedback_threads')
    .insert({
      user_id: user.id,
      org_id: orgMember?.org_id || null,
      subject,
      category,
      priority: priority || 'normal',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Add the first message
  await supabase.from('feedback_messages').insert({
    thread_id: thread.id,
    sender_id: user.id,
    sender_role: 'user',
    content,
  })

  // Mirror to the WitUS Inbox so BAM triages every product from one place.
  // Non-blocking: registered before redirect(), runs after the response.
  after(() =>
    mirrorFeedbackToInbox({
      category,
      subject,
      content,
      threadId: thread.id,
      kind: 'new',
      submitterEmail: user.email,
      submitterName: displayNameOf(user),
    })
  )

  revalidatePath('/feedback')
  redirect(`/feedback/${thread.id}`)
}

export async function sendFeedbackMessage(threadId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  if (!content) return { error: 'Message is required' }

  const senderRole = isSuperAdmin(user.email) ? 'admin' : 'user'

  // If admin, use admin client to bypass RLS
  const client = senderRole === 'admin' ? createAdminClient() : supabase

  const { data: insertedMessage, error } = await client
    .from('feedback_messages')
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      sender_role: senderRole,
      content,
    })
    .select('id')
    .single()

  if (error || !insertedMessage) return { error: error?.message || 'insert failed' }

  // Update thread timestamp
  await client.from('feedback_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId)

  // If admin responding, mark as in_progress
  if (senderRole === 'admin') {
    await client.from('feedback_threads').update({ status: 'in_progress' }).eq('id', threadId)

    // Create notification + send email. The notification insert is the
    // idempotency key — feedback_notifications has a UNIQUE INDEX on
    // (thread_id, message_id) per migration 038, so if this action
    // runs twice (Server Action retry, double-click) the second
    // insert hits 23505 and we skip the email. Fixes the
    // duplicate-email bug reported on 2026-05-30.
    const { data: thread } = await client.from('feedback_threads').select('user_id, subject').eq('id', threadId).single()
    if (thread) {
      const { error: notifErr } = await client
        .from('feedback_notifications')
        .insert({
          thread_id: threadId,
          recipient_id: thread.user_id,
          message_id: insertedMessage.id,
        })

      const isDuplicate = notifErr?.code === '23505'

      if (!isDuplicate) {
        try {
          const { sendEmail, isMailgunConfigured } = await import('@/lib/email/mailgun')
          if (isMailgunConfigured()) {
            // Get user email
            const { data: userData } = await client.auth.admin.getUserById(thread.user_id)
            if (userData?.user?.email) {
              await sendEmail({
                to: userData.user.email,
                subject: `Reply to your feedback: "${thread.subject}"`,
                tags: ['feedback', 'feedback:reply', `message:${insertedMessage.id}`],
                html: `
                  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                    <h2 style="margin:0 0 16px;">You have a reply on your feedback</h2>
                    <p style="color:#666;margin:0 0 16px;">An admin responded to <strong>"${thread.subject}"</strong>:</p>
                    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 16px;">
                      <p style="margin:0;white-space:pre-wrap;">${content}</p>
                    </div>
                    <a href="https://tour.witus.online/feedback/${threadId}" style="display:inline-block;padding:12px 24px;background-color:#4553ea;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">View Conversation</a>
                    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">— Tour Manager OS | Tour.WitUS.Online</p>
                  </div>
                `,
              })
            }
          }
        } catch {
          // Email sending is non-critical — don't fail the action
        }
      }
    }
  }

  // User follow-up replies also mirror to the Inbox so the whole conversation
  // reaches BAM in one place. Admin replies don't — those are BAM's own.
  if (senderRole === 'user') {
    const { data: t } = await client
      .from('feedback_threads')
      .select('subject, category')
      .eq('id', threadId)
      .single()
    if (t) {
      after(() =>
        mirrorFeedbackToInbox({
          category: t.category,
          subject: t.subject,
          content,
          threadId,
          kind: 'reply',
          submitterEmail: user.email,
          submitterName: displayNameOf(user),
        })
      )
    }
  }

  revalidatePath(`/feedback/${threadId}`)
  revalidatePath(`/admin/feedback/${threadId}`)
  return { success: true }
}

/**
 * HelpBubble FAB submission. The bubble used to insert into Supabase directly
 * from the browser; it now calls this server action so the submission also
 * mirrors to the WitUS Inbox (the HMAC secret must stay server-side). Returns
 * the new thread id (or an error) without redirecting — the bubble keeps its
 * own optimistic "Thank you" UI.
 */
export async function submitHelpBubbleFeedback(input: {
  subject: string
  category: string
  content: string
}): Promise<{ threadId: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const subject = input.subject?.trim()
  const content = input.content?.trim()
  const category = input.category?.trim()
  if (!subject || !content || !category) {
    return { error: 'Subject, category, and message are required' }
  }

  // Get user's org
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const priority = category === 'bug' ? 'high' : 'normal'

  const { data: thread, error } = await supabase
    .from('feedback_threads')
    .insert({
      user_id: user.id,
      org_id: orgMember?.org_id || null,
      subject,
      category,
      priority,
    })
    .select('id')
    .single()

  if (error || !thread) return { error: error?.message || 'Could not create feedback' }

  const { error: msgError } = await supabase.from('feedback_messages').insert({
    thread_id: thread.id,
    sender_id: user.id,
    sender_role: 'user',
    content,
  })
  if (msgError) return { error: msgError.message }

  after(() =>
    mirrorFeedbackToInbox({
      category,
      subject,
      content,
      threadId: thread.id,
      kind: 'new',
      submitterEmail: user.email,
      submitterName: displayNameOf(user),
    })
  )

  revalidatePath('/feedback')
  return { threadId: thread.id }
}

/**
 * User-side mark-resolved. Either confirms the issue is fixed (closes
 * the thread + flips status to resolved) or signals it's still
 * happening (re-opens for admin attention). Only the original reporter
 * can call this.
 */
export async function markFeedbackResolved(
  threadId: string,
  action: 'confirmed_fixed' | 'still_happening',
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { data: thread, error: threadErr } = await supabase
    .from('feedback_threads')
    .select('id, user_id, status, subject')
    .eq('id', threadId)
    .maybeSingle()
  if (threadErr || !thread) return { error: 'Thread not found.' }
  if (thread.user_id !== user.id) {
    return { error: 'Only the reporter can mark this resolved.' }
  }

  const admin = createAdminClient()
  const newStatus =
    action === 'confirmed_fixed' ? 'resolved' : 'open'

  await admin
    .from('feedback_threads')
    .update({
      status: newStatus,
      user_resolved_at: new Date().toISOString(),
      user_resolved_action: action,
    })
    .eq('id', threadId)

  // Post a system message so admins see the user's signal inline.
  const body =
    action === 'confirmed_fixed'
      ? '✅ Reporter confirmed this is fixed.'
      : '⚠️ Reporter says this is still happening.'
  await admin.from('feedback_messages').insert({
    thread_id: threadId,
    sender_id: user.id,
    body,
    is_admin: false,
  })

  revalidatePath(`/feedback/${threadId}`)
  revalidatePath('/feedback')
  revalidatePath('/admin/feedback')
  return { ok: true }
}

export async function updateThreadStatus(threadId: string, status: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('feedback_threads')
    .update({ status })
    .eq('id', threadId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/feedback/${threadId}`)
  revalidatePath('/admin/feedback')
  return { success: true }
}
