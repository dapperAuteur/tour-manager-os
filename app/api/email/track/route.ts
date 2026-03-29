import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 1x1 transparent pixel
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('campaign')
  const action = searchParams.get('action')

  if (!campaignId) {
    return new NextResponse(PIXEL, { headers: { 'Content-Type': 'image/gif' } })
  }

  const supabase = createAdminClient()

  if (action === 'open') {
    // Increment open count
    const { data } = await supabase
      .from('email_campaigns')
      .select('opened_count')
      .eq('id', campaignId)
      .single()

    if (data) {
      await supabase
        .from('email_campaigns')
        .update({ opened_count: (data.opened_count || 0) + 1 })
        .eq('id', campaignId)
    }

    return new NextResponse(PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }

  if (action === 'unsubscribe') {
    // Show a simple unsubscribe confirmation page
    return new NextResponse(
      `<!DOCTYPE html>
      <html><head><title>Unsubscribed</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:60px 20px;">
        <h1>You've been unsubscribed</h1>
        <p>You will no longer receive marketing emails from this sender.</p>
        <p style="color:#999;font-size:14px;">Tour Manager OS</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Click tracking — increment and redirect
  if (action === 'click') {
    await supabase
      .from('email_campaigns')
      .select('clicked_count')
      .eq('id', campaignId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('email_campaigns')
            .update({ clicked_count: (data.clicked_count || 0) + 1 })
            .eq('id', campaignId)
        }
      })

    const redirectUrl = searchParams.get('url') || '/'
    return NextResponse.redirect(redirectUrl)
  }

  return new NextResponse(PIXEL, { headers: { 'Content-Type': 'image/gif' } })
}
