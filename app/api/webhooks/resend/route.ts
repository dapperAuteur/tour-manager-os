import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createAdminClient()

  // Resend webhook events
  // https://resend.com/docs/dashboard/webhooks/event-types
  const { type, data } = body

  switch (type) {
    case 'email.delivered':
      // Email was successfully delivered
      break

    case 'email.opened':
      // Track open — find campaign by matching headers/tags if available
      break

    case 'email.clicked':
      // Track click
      break

    case 'email.bounced':
      // Handle bounce — mark subscriber as bounced
      if (data?.to?.[0]) {
        await supabase
          .from('email_subscribers')
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq('email', data.to[0])
      }
      break

    case 'email.complained':
      // Handle spam complaint — unsubscribe
      if (data?.to?.[0]) {
        await supabase
          .from('email_subscribers')
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq('email', data.to[0])
      }
      break
  }

  return NextResponse.json({ received: true })
}
