import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyMailgunSignature } from '@/lib/email/mailgun'

interface MailgunPayload {
  signature?: { timestamp: string; token: string; signature: string }
  'event-data'?: {
    event: string
    severity?: string
    recipient?: string
    tags?: string[]
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as MailgunPayload | null
  if (!body || !body.signature || !body['event-data']) {
    return NextResponse.json({ error: 'malformed payload' }, { status: 400 })
  }

  if (!verifyMailgunSignature(body.signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { event, severity, recipient } = body['event-data']

  switch (event) {
    case 'delivered':
    case 'opened':
    case 'clicked':
      break

    case 'failed':
      // Permanent bounce: unsubscribe; transient (temporary) we ignore.
      if (severity === 'permanent' && recipient) {
        await supabase
          .from('email_subscribers')
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq('email', recipient)
      }
      break

    case 'complained':
    case 'unsubscribed':
      if (recipient) {
        await supabase
          .from('email_subscribers')
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq('email', recipient)
      }
      break
  }

  return NextResponse.json({ received: true })
}
