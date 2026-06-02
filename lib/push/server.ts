import webpush, { type PushSubscription } from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/observability/logger'

export type PushTopic =
  | 'schedule_change'
  | 'advance_submitted'
  | 'poll_closing'
  | 'test'

export interface PushPayload {
  title: string
  body: string
  url?: string
  topic: PushTopic
}

function configure(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:tools@awews.com'
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(subject, publicKey, privateKey)
  return true
}

interface DbSubscription {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  topics: string[] | null
}

function toWebPush(row: DbSubscription): PushSubscription {
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  }
}

/**
 * Fan a push to every device registered for a user that has opted into
 * the given topic. Best-effort — 404/410 endpoints are pruned, other
 * errors are logged but never thrown so the caller's main flow is
 * never blocked by push failures.
 */
export async function pushToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; pruned: number; failed: number }> {
  if (!configure()) return { sent: 0, pruned: 0, failed: 0 }

  const admin = createAdminClient()
  const { data: rows } = await admin
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth, topics')
    .eq('user_id', userId)
  const subs = (rows || []) as DbSubscription[]
  const targeted = subs.filter(
    (s) => !s.topics || s.topics.includes(payload.topic),
  )

  let sent = 0
  let pruned = 0
  let failed = 0
  const stale: string[] = []

  await Promise.all(
    targeted.map(async (row) => {
      try {
        await webpush.sendNotification(toWebPush(row), JSON.stringify(payload))
        sent++
        await admin
          .from('push_subscriptions')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', row.id)
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          stale.push(row.id)
          pruned++
        } else {
          failed++
          logError('push.send_failed', err, {
            user_id: userId,
            topic: payload.topic,
            status: statusCode,
          })
        }
      }
    }),
  )

  if (stale.length > 0) {
    await admin.from('push_subscriptions').delete().in('id', stale)
  }

  return { sent, pruned, failed }
}
