import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import {
  buildGmailOauthUrl,
  isGmailOauthConfigured,
} from '@/lib/email/gmail'

/**
 * GET /api/oauth/gmail/init
 *
 * Generates a short-lived state cookie that ties the OAuth round-trip
 * to the signed-in user, then redirects to Google&rsquo;s consent
 * screen. The callback verifies the state matches and the user is
 * still signed in before persisting tokens.
 */
export async function GET() {
  if (!isGmailOauthConfigured()) {
    return NextResponse.json(
      {
        error:
          'Gmail OAuth not configured — set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI.',
      },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const state = randomBytes(16).toString('hex')
  const url = buildGmailOauthUrl(state)
  const res = NextResponse.redirect(url)
  res.cookies.set('tmos_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return res
}
