import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  exchangeCodeForTokens,
  gmailScopes,
  getEmailFromAccessToken,
  isGmailOauthConfigured,
} from '@/lib/email/gmail'
import { logError } from '@/lib/observability/logger'

/**
 * GET /api/oauth/gmail/callback?code=…&state=…
 *
 * Verifies the state cookie matches, exchanges the code for tokens,
 * resolves the user's primary email, and stores the connection on
 * `oauth_email_connections`. Redirects to `/settings` with a flash
 * query param on success / failure.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  const settings = new URL('/settings', url)
  if (error) {
    settings.searchParams.set('gmail_oauth', 'cancelled')
    return NextResponse.redirect(settings)
  }
  if (!code || !state) {
    settings.searchParams.set('gmail_oauth', 'invalid_response')
    return NextResponse.redirect(settings)
  }
  if (!isGmailOauthConfigured()) {
    settings.searchParams.set('gmail_oauth', 'unconfigured')
    return NextResponse.redirect(settings)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    settings.searchParams.set('gmail_oauth', 'signed_out')
    return NextResponse.redirect(settings)
  }

  // Verify state matches what we issued on /init. Lax + httpOnly cookie
  // survives the Google redirect.
  const cookieHeader = request.headers.get('cookie') || ''
  const stateCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('tmos_oauth_state='))
    ?.split('=')[1]
  if (!stateCookie || stateCookie !== state) {
    settings.searchParams.set('gmail_oauth', 'state_mismatch')
    return NextResponse.redirect(settings)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    if (!tokens.refresh_token) {
      // We force prompt=consent on /init so this should always include
      // a refresh token. If it doesn't, the user revoked + reauthed via
      // a path that skipped consent — surface a clear error.
      settings.searchParams.set('gmail_oauth', 'no_refresh_token')
      return NextResponse.redirect(settings)
    }
    const emailAddress = await getEmailFromAccessToken(tokens.access_token)
    if (!emailAddress) {
      settings.searchParams.set('gmail_oauth', 'no_email')
      return NextResponse.redirect(settings)
    }
    const admin = createAdminClient()
    await admin.from('oauth_email_connections').upsert(
      {
        user_id: user.id,
        provider: 'gmail',
        email_address: emailAddress,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scopes: gmailScopes(),
        expires_at: new Date(
          Date.now() + (tokens.expires_in - 30) * 1000,
        ).toISOString(),
      },
      { onConflict: 'user_id,provider' },
    )
    settings.searchParams.set('gmail_oauth', 'connected')
  } catch (err) {
    logError('email.gmail.callback_failed', err, { user_id: user.id })
    settings.searchParams.set('gmail_oauth', 'failed')
  }

  const res = NextResponse.redirect(settings)
  // Burn the state cookie.
  res.cookies.set('tmos_oauth_state', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
