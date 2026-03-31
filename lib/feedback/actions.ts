'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/auth/super-admin'

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

  const { error } = await client.from('feedback_messages').insert({
    thread_id: threadId,
    sender_id: user.id,
    sender_role: senderRole,
    content,
  })

  if (error) return { error: error.message }

  // Update thread timestamp
  await client.from('feedback_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId)

  // If admin responding, mark as in_progress
  if (senderRole === 'admin') {
    await client.from('feedback_threads').update({ status: 'in_progress' }).eq('id', threadId)

    // Create notification for the user + send email
    const { data: thread } = await client.from('feedback_threads').select('user_id, subject').eq('id', threadId).single()
    if (thread) {
      await client.from('feedback_notifications').insert({
        thread_id: threadId,
        recipient_id: thread.user_id,
      })

      // Send email notification
      try {
        const { getResend, DEFAULT_FROM } = await import('@/lib/email/resend')
        const resend = getResend()
        if (resend) {
          // Get user email
          const { data: userData } = await client.auth.admin.getUserById(thread.user_id)
          if (userData?.user?.email) {
            await resend.emails.send({
              from: DEFAULT_FROM,
              to: userData.user.email,
              subject: `Reply to your feedback: "${thread.subject}"`,
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

  revalidatePath(`/feedback/${threadId}`)
  revalidatePath(`/admin/feedback/${threadId}`)
  return { success: true }
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
