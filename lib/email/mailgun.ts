import { createHmac, timingSafeEqual } from 'node:crypto'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  tags?: string[]
}

export interface SendEmailResult {
  id: string
  message: string
}

function getApiBase(): string {
  const region = (process.env.MAILGUN_REGION || 'us').toLowerCase()
  return region === 'eu'
    ? 'https://api.eu.mailgun.net'
    : 'https://api.mailgun.net'
}

export function getDefaultFrom(): string {
  return (
    process.env.EMAIL_FROM ||
    'Tour Manager OS <noreply@mg.witus.online>'
  )
}

export function isMailgunConfigured(): boolean {
  const key = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  return !!key && !!domain && key !== 'your-mailgun-api-key'
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  if (!apiKey || !domain) {
    throw new Error('Mailgun not configured: MAILGUN_API_KEY and MAILGUN_DOMAIN must be set')
  }

  const form = new URLSearchParams()
  form.set('from', opts.from || getDefaultFrom())
  if (Array.isArray(opts.to)) {
    for (const addr of opts.to) form.append('to', addr)
  } else {
    form.set('to', opts.to)
  }
  form.set('subject', opts.subject)
  form.set('html', opts.html)
  if (opts.text) form.set('text', opts.text)
  if (opts.replyTo) form.set('h:Reply-To', opts.replyTo)
  if (opts.tags) {
    for (const tag of opts.tags) form.append('o:tag', tag)
  }

  const auth = Buffer.from(`api:${apiKey}`).toString('base64')
  const res = await fetch(`${getApiBase()}/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Mailgun send failed (${res.status}): ${text}`)
  }
  return (await res.json()) as SendEmailResult
}

// Mailgun webhook signature verification.
// Mailgun signs each webhook with HMAC-SHA256 of `timestamp + token` keyed by
// the API key, and includes the hex digest as `signature.signature`. Reject
// requests where the timestamp is older than 5 minutes to limit replay risk.
const MAX_SIG_AGE_SECONDS = 300

export interface MailgunSignature {
  timestamp: string
  token: string
  signature: string
}

export function verifyMailgunSignature(sig: MailgunSignature): boolean {
  // Mailgun has TWO keys: the API key (for the sending API, named
  // MAILGUN_API_KEY) and the HTTP-webhook signing key (used to verify
  // inbound events). They are different. Add the webhook signing key
  // from Mailgun → Sending → Webhooks → "HTTP webhook signing key"
  // as MAILGUN_WEBHOOK_SIGNING_KEY. Falls back to MAILGUN_API_KEY for
  // backward compatibility but Mailgun's webhook signatures only
  // verify against the webhook signing key, so 401s are expected
  // without it.
  const signingKey =
    process.env.MAILGUN_WEBHOOK_SIGNING_KEY || process.env.MAILGUN_API_KEY
  if (!signingKey) return false
  if (!sig.timestamp || !sig.token || !sig.signature) return false

  const ageSec = Math.floor(Date.now() / 1000) - Number(sig.timestamp)
  if (!Number.isFinite(ageSec) || ageSec > MAX_SIG_AGE_SECONDS || ageSec < -MAX_SIG_AGE_SECONDS) {
    return false
  }

  const expected = createHmac('sha256', signingKey)
    .update(sig.timestamp + sig.token)
    .digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(sig.signature)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
