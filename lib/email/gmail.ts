import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/observability/logger'

export interface GmailConnection {
  user_id: string
  email_address: string
  access_token: string
  refresh_token: string
  expires_at: string | null
  scopes: string[] | null
}

export function isGmailOauthConfigured(): boolean {
  return !!(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  )
}

export function gmailScopes(): string[] {
  return [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
  ]
}

/** First leg of the OAuth flow — build the URL we redirect the user to. */
export function buildGmailOauthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
    response_type: 'code',
    scope: gmailScopes().join(' '),
    // Refresh token only ships on the first consent; force it so we
    // can keep sending after the access token expires.
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

export async function exchangeCodeForTokens(
  code: string,
): Promise<GoogleTokenResponse> {
  const form = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
    grant_type: 'authorization_code',
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Google token exchange failed (${res.status}): ${txt}`)
  }
  return (await res.json()) as GoogleTokenResponse
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<{ access_token: string; expires_in: number }> {
  const form = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Google token refresh failed (${res.status}): ${txt}`)
  }
  return (await res.json()) as { access_token: string; expires_in: number }
}

export async function getEmailFromAccessToken(
  accessToken: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (!res.ok) return null
    const json = (await res.json()) as { email?: string }
    return json.email ?? null
  } catch {
    return null
  }
}

async function ensureFreshAccessToken(
  conn: GmailConnection,
): Promise<string> {
  // Refresh ~30s before stated expiry to avoid edge-of-window failures.
  if (conn.expires_at) {
    const expiresMs = new Date(conn.expires_at).getTime()
    if (expiresMs - Date.now() > 30_000) {
      return conn.access_token
    }
  }
  const { access_token, expires_in } = await refreshAccessToken(
    conn.refresh_token,
  )
  const admin = createAdminClient()
  await admin
    .from('oauth_email_connections')
    .update({
      access_token,
      expires_at: new Date(Date.now() + (expires_in - 30) * 1000).toISOString(),
    })
    .eq('user_id', conn.user_id)
    .eq('provider', 'gmail')
  return access_token
}

export async function getGmailConnection(
  userId: string,
): Promise<GmailConnection | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('oauth_email_connections')
    .select(
      'user_id, email_address, access_token, refresh_token, expires_at, scopes',
    )
    .eq('user_id', userId)
    .eq('provider', 'gmail')
    .maybeSingle()
  return (data as GmailConnection | null) ?? null
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

interface SendOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  /** Optional Reply-To override; defaults to the connected mailbox. */
  replyTo?: string
}

/**
 * Sends a single email through the user's connected Gmail account
 * via the Gmail API. Returns the message id Google returns so the
 * caller can log it. Refreshes the access token transparently.
 *
 * Outbound appears in the user's Sent folder; replies route to
 * their inbox — same as if they composed the email by hand.
 */
export async function sendViaGmail(
  userId: string,
  opts: SendOptions,
): Promise<{ id: string }> {
  const conn = await getGmailConnection(userId)
  if (!conn) throw new Error('No Gmail connection for user.')
  const accessToken = await ensureFreshAccessToken(conn)

  const to = Array.isArray(opts.to) ? opts.to.join(', ') : opts.to
  const boundary = `tmos_${Math.random().toString(36).slice(2)}`
  const headers: string[] = [
    `From: ${conn.email_address}`,
    `To: ${to}`,
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ]
  if (opts.replyTo) headers.push(`Reply-To: ${opts.replyTo}`)

  const body = [
    headers.join('\r\n'),
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    opts.text || opts.html.replace(/<[^>]+>/g, ''),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    opts.html,
    '',
    `--${boundary}--`,
  ].join('\r\n')

  const raw = base64UrlEncode(body)
  try {
    const res = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      },
    )
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`Gmail send failed (${res.status}): ${txt}`)
    }
    const json = (await res.json()) as { id: string }
    return { id: json.id }
  } catch (err) {
    logError('email.gmail.send_failed', err, { user_id: userId })
    throw err
  }
}
