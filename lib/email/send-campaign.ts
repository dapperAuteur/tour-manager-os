'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, isMailgunConfigured } from './mailgun'
import { getGmailConnection, sendViaGmail } from './gmail'

export async function sendCampaign(campaignId: string) {
  const mailgunReady = isMailgunConfigured()
  const supabase = createAdminClient()

  // Get campaign
  const { data: campaign, error: campError } = await supabase
    .from('email_campaigns')
    .select('*, email_lists(id, name)')
    .eq('id', campaignId)
    .single()

  if (campError || !campaign) return { error: 'Campaign not found' }
  if (campaign.status === 'sent') return { error: 'Campaign already sent' }

  // Get subscribers
  let subscriberQuery = supabase.from('email_subscribers').select('email, name')

  if (campaign.list_id) {
    subscriberQuery = subscriberQuery.eq('list_id', campaign.list_id)
  }

  subscriberQuery = subscriberQuery.is('unsubscribed_at', null)

  const { data: subscribers } = await subscriberQuery

  if (!subscribers || subscribers.length === 0) {
    return { error: 'No subscribers to send to' }
  }

  // Mark as sending
  await supabase
    .from('email_campaigns')
    .update({ status: 'sending' })
    .eq('id', campaignId)

  // Prefer the campaign creator's connected Gmail when available so
  // outbound shows in their Sent folder and replies route to their
  // inbox. Falls back to Mailgun (or simulated send) otherwise.
  const gmailConn = campaign.created_by
    ? await getGmailConnection(campaign.created_by)
    : null

  if (!mailgunReady && !gmailConn) {
    // Neither sender configured — simulate send
    await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipients_count: subscribers.length,
      })
      .eq('id', campaignId)

    return { success: true, message: 'Campaign marked as sent (no email sender configured — Mailgun unset and creator has no connected Gmail)', count: subscribers.length }
  }

  // Send via Mailgun
  let sentCount = 0
  const errors: string[] = []

  // Build HTML with tracking pixel
  const trackingPixelUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://tour.witus.online' : 'http://localhost:3000'}/api/email/track?campaign=${campaignId}`
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${campaign.content.split('\n').map((line: string) => `<p style="margin: 0 0 16px; line-height: 1.6;">${line}</p>`).join('')}
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
      <p style="font-size: 12px; color: #999;">
        Sent via Tour Manager OS<br/>
        <a href="${trackingPixelUrl}&action=unsubscribe" style="color: #999;">Unsubscribe</a>
      </p>
      <img src="${trackingPixelUrl}&action=open" width="1" height="1" alt="" style="display:none;" />
    </div>
  `

  // Send in batches of 10
  for (let i = 0; i < subscribers.length; i += 10) {
    const batch = subscribers.slice(i, i + 10)

    const results = await Promise.allSettled(
      batch.map((sub) =>
        gmailConn
          ? sendViaGmail(gmailConn.user_id, {
              to: sub.email,
              subject: campaign.subject,
              html: htmlContent,
            })
          : sendEmail({
              to: sub.email,
              subject: campaign.subject,
              html: htmlContent,
              tags: ['campaign', `campaign:${campaignId}`],
            }),
      ),
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        sentCount++
      } else {
        errors.push(result.reason?.message || 'Unknown error')
      }
    }
  }

  // Update campaign status
  await supabase
    .from('email_campaigns')
    .update({
      status: errors.length === subscribers.length ? 'failed' : 'sent',
      sent_at: new Date().toISOString(),
      recipients_count: sentCount,
    })
    .eq('id', campaignId)

  return {
    success: true,
    count: sentCount,
    errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
  }
}
