import { describe, expect, it } from 'vitest'
import type { ErrorEvent } from '@sentry/nextjs'
import { scrubEvent, scrubQueryString, scrubText, scrubUrl } from './sentry-scrub'

// The contract this file defends: nothing that could be replayed as a credential, and no personal
// contact detail, may leave the process in a crash report. The counter-requirement is just as
// real: a report that hides which tour or show broke is useless, so public resource ids survive.

// Every credential-shaped fixture below is ASSEMBLED AT RUNTIME, never written as a string
// literal. GitHub push protection scans committed text for real vendor key shapes and rejects the
// push, so a literal `sk_live_...` in a test file would block the branch even though the value is
// fake. Joining the parts keeps the shape at runtime and off the disk.
const ADVANCE_TOKEN = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
const TOUR_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301'
const JWT = ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiJ0ZXN0In0', 'c2lnbmF0dXJlcGxhY2Vob2xkZXI'].join('.')
const API_KEY = ['tm', 'live', 'a1b2c3d4'.repeat(8)].join('_')
const STRIPE_KEY = ['sk', 'live', '51' + 'AbCdEf12'.repeat(3)].join('_')
const STRIPE_WEBHOOK_SECRET = ['whsec', 'abcdefghijklmnop'].join('_')
const MAILGUN_KEY = ['key', 'abcdef0123456789'.repeat(2)].join('-')

describe('scrubUrl', () => {
  it('masks the anonymous advance-sheet token, which is a working credential', () => {
    const out = scrubUrl(`https://tour.witus.online/advance/${ADVANCE_TOKEN}`)
    expect(out).not.toContain(ADVANCE_TOKEN)
    expect(out).toBe('https://tour.witus.online/advance/<token>')
  })

  it('masks the advance token on a relative navigation breadcrumb too', () => {
    expect(scrubUrl(`/advance/${ADVANCE_TOKEN}`)).toBe('/advance/<token>')
  })

  it('masks the Supabase auth code exchange', () => {
    const out = scrubUrl('https://tour.witus.online/auth/callback?code=pkce-abc123&next=/today')
    expect(out).not.toContain('pkce-abc123')
    expect(out).toContain('/auth/callback')
  })

  it('masks the Google OAuth callback code and state', () => {
    const out = scrubUrl(
      'https://tour.witus.online/api/oauth/gmail/callback?code=4/0Ab_x9&state=deadbeefdeadbeef',
    )
    expect(out).not.toContain('4/0Ab_x9')
    expect(out).not.toContain('deadbeefdeadbeef')
  })

  it('masks the HMAC ticket signature while keeping the ticket id', () => {
    const out = scrubUrl(`https://tour.witus.online/tickets/${TOUR_ID}?token=abcdef123456`)
    expect(out).not.toContain('abcdef123456')
    expect(out).toContain(TOUR_ID)
  })

  it('drops a Supabase implicit-flow token hidden in the URL fragment', () => {
    const out = scrubUrl(`https://tour.witus.online/today#access_token=${JWT}&type=recovery`)
    expect(out).not.toContain(JWT)
    expect(out).toContain('/today')
  })

  it('keeps public resource ids so a report still says which page broke', () => {
    expect(scrubUrl(`/tours/${TOUR_ID}/shows/${ADVANCE_TOKEN}`)).toBe(
      `/tours/${TOUR_ID}/shows/${ADVANCE_TOKEN}`,
    )
    expect(scrubUrl('/venues/map?state=NC')).toBe('/venues/map?state=NC')
  })

  it('keeps human slugs, which are long but not opaque', () => {
    const slug = '/help/how-to-send-an-advance-sheet-to-a-venue'
    expect(scrubUrl(slug)).toBe(slug)
  })

  it('masks an opaque blob even outside a credential path', () => {
    expect(scrubUrl('/photos/' + 'a1b2c3d4'.repeat(8))).toBe('/photos/<token>')
  })

  it('redacts anything it cannot parse rather than forwarding it', () => {
    expect(scrubUrl('not a url at all')).toBe('<redacted url>')
  })
})

describe('scrubText', () => {
  it('removes Supabase JWTs', () => {
    const out = scrubText(`Auth failed for token ${JWT}`)
    expect(out).not.toContain(JWT)
    expect(out).toContain('<jwt>')
  })

  it('removes tour-manager API keys', () => {
    expect(scrubText(`Invalid key ${API_KEY}`)).not.toContain(API_KEY)
  })

  it('removes Stripe and Mailgun credentials', () => {
    const out = scrubText(
      `charge failed with ${STRIPE_KEY}, signature ${STRIPE_WEBHOOK_SECRET}, mail ${MAILGUN_KEY}`,
    )
    expect(out).not.toContain(STRIPE_KEY)
    expect(out).not.toContain(STRIPE_WEBHOOK_SECRET)
    expect(out).not.toContain(MAILGUN_KEY)
  })

  it('removes an env-var-shaped labelled secret, where underscores defeat \\b', () => {
    // `\b(secret)\b` never matches inside STRIPE_WEBHOOK_SECRET because `_` is a word character.
    const value = 'sup3rsecretvalue'
    for (const line of [
      `STRIPE_WEBHOOK_SECRET=${value}`,
      `SUPABASE_SERVICE_ROLE_KEY=${value}`,
      `TICKET_SIGNING_SECRET: ${value}`,
      `GOOGLE_OAUTH_CLIENT_SECRET=${value}`,
    ]) {
      expect(scrubText(line), line).not.toContain(value)
    }
  })

  it('removes Authorization header values pasted into a message', () => {
    const out = scrubText(`fetch failed with Bearer ${API_KEY}`)
    expect(out).not.toContain(API_KEY)
    // The specific format wins over the generic Bearer rule, so triage still learns which kind of
    // credential was involved without learning the credential.
    expect(out).toContain('<api-key>')
  })

  it('removes a bearer value in an unrecognised format', () => {
    const opaque = 'Zm9vYmFyYmF6cXV1eDEyMzQ1Njc4OTA'
    const out = scrubText(`401 from upstream, sent Bearer ${opaque}`)
    expect(out).not.toContain(opaque)
    expect(out).toContain('Bearer <redacted>')
  })

  it('masks a credential path quoted in a message', () => {
    const out = scrubText(`GET /advance/${ADVANCE_TOKEN} returned 500`)
    expect(out).not.toContain(ADVANCE_TOKEN)
    expect(out).toContain('/advance/<token>')
  })

  it('scrubs two credential paths in the same message', () => {
    // The path boundary consumes a character rather than looking behind it (lookbehind is a
    // SyntaxError on older iOS Safari), so adjacent matches are the case that could regress.
    const out = scrubText(`redirect /advance/${ADVANCE_TOKEN} to /advance/${ADVANCE_TOKEN}`)
    expect(out).not.toContain(ADVANCE_TOKEN)
    expect(out.match(/<token>/g)?.length).toBe(2)
  })

  it('keeps stack-frame file paths readable', () => {
    const frame = 'at handler (/var/task/.next/server/app/tours/page.js:12:5)'
    expect(scrubText(frame)).toContain('/var/task/.next/server/app/tours/page.js')
  })

  it('removes email addresses of venue contacts and purchasers', () => {
    const out = scrubText('failed to email booking@thevenue.com about the advance')
    expect(out).not.toContain('booking@thevenue.com')
    expect(out).toContain('<email>')
  })

  it('removes labelled raw secrets', () => {
    const out = scrubText('connect with password: hunter2sostrong')
    expect(out).not.toContain('hunter2sostrong')
  })

  it('scrubs URLs embedded in prose', () => {
    const out = scrubText(`GET https://tour.witus.online/advance/${ADVANCE_TOKEN} returned 500`)
    expect(out).not.toContain(ADVANCE_TOKEN)
    expect(out).toContain('returned 500')
  })

  it('leaves ordinary prose intact', () => {
    const message = 'Cannot read properties of undefined (reading "venue_name")'
    expect(scrubText(message)).toBe(message)
  })
})

describe('scrubQueryString', () => {
  // request.query_string is a field of its own, and a bare query string is neither a parseable URL
  // nor a path, so a URL-only pass would ship it verbatim.
  it('masks a bearer token in a bare query string', () => {
    const out = scrubQueryString('token=sig-abcdef123456&show=next')
    expect(out).not.toContain('sig-abcdef123456')
    expect(out).toContain('show=next')
  })

  it('masks an OAuth code with no path context to lean on', () => {
    expect(scrubQueryString('code=4/0Ab_x9&scope=gmail.send')).not.toContain('4/0Ab_x9')
  })

  it('masks an email address passed as a filter value', () => {
    const out = scrubQueryString('q=fan%40example.com')
    expect(out).not.toContain('fan@example.com')
    expect(out).not.toContain('fan%40example.com')
  })

  it('masks a JWT that survived on a harmless-looking parameter name', () => {
    expect(scrubQueryString(`redirect=/today&t=${JWT}`)).not.toContain(JWT)
  })

  it('keeps ordinary filters readable', () => {
    expect(scrubQueryString('state=NC&page=2')).toBe('state=NC&page=2')
  })

  it('tolerates a leading question mark and non-query text', () => {
    expect(scrubQueryString('?page=2')).toBe('?page=2')
    expect(scrubQueryString('')).toBe('')
  })
})

describe('scrubEvent', () => {
  function eventWithSecrets(): ErrorEvent {
    return {
      type: undefined,
      message: `POST /advance/${ADVANCE_TOKEN} rejected for booking@thevenue.com`,
      exception: {
        values: [
          {
            type: 'Error',
            value: `Bad token ${JWT} using ${STRIPE_KEY} / ${STRIPE_WEBHOOK_SECRET} / ${MAILGUN_KEY}`,
          },
        ],
      },
      user: {
        id: 'user-1',
        email: 'crew@example.com',
        ip_address: '203.0.113.7',
        username: 'roadie',
      },
      request: {
        url: `https://tour.witus.online/advance/${ADVANCE_TOKEN}`,
        // Deliberately an OPAQUE token, not a recognisable vendor format, so this asserts the
        // parameter-name masking rather than accidentally passing via a key-format rule.
        query_string: 'token=sig-abcdef123456&next=/today',
        cookies: { 'sb-access-token': JWT },
        headers: {
          cookie: `sb-access-token=${JWT}`,
          authorization: `Bearer ${API_KEY}`,
          'set-cookie': `sb-refresh-token=${JWT}`,
          'stripe-signature': 't=1,v1=deadbeefsignature',
          'user-agent': 'Mozilla/5.0',
        },
        data: `{"purchaser_email":"fan@example.com"}`,
      },
      breadcrumbs: [
        {
          category: 'navigation',
          data: { from: '/today', to: `/advance/${ADVANCE_TOKEN}` },
        },
        {
          category: 'fetch',
          message: `GET /tickets/${TOUR_ID}?token=sig-abcdef123456`,
          data: { url: `/tickets/${TOUR_ID}?token=sig-abcdef123456` },
        },
      ],
    } as ErrorEvent
  }

  it('leaks no secret anywhere in the serialized payload', () => {
    const serialized = JSON.stringify(scrubEvent(eventWithSecrets()))

    for (const secret of [
      ADVANCE_TOKEN,
      JWT,
      API_KEY,
      'booking@thevenue.com',
      'crew@example.com',
      'fan@example.com',
      '203.0.113.7',
      'roadie',
      'sig-abcdef123456',
      'sb-access-token',
      'deadbeefsignature',
      STRIPE_KEY,
      STRIPE_WEBHOOK_SECRET,
      MAILGUN_KEY,
    ]) {
      expect(serialized, `leaked ${secret}`).not.toContain(secret)
    }
  })

  it('strips identity but keeps the stable user id for grouping', () => {
    const out = scrubEvent(eventWithSecrets())
    expect(out.user?.email).toBeUndefined()
    expect(out.user?.ip_address).toBeUndefined()
    expect(out.user?.username).toBeUndefined()
    expect(out.user?.id).toBe('user-1')
  })

  it('drops cookies and credential headers but keeps triage headers', () => {
    const out = scrubEvent(eventWithSecrets())
    expect(out.request?.cookies).toBeUndefined()
    const headers = out.request?.headers as Record<string, string>
    expect(headers.cookie).toBeUndefined()
    expect(headers.authorization).toBeUndefined()
    expect(headers['set-cookie']).toBeUndefined()
    expect(headers['user-agent']).toBe('Mozilla/5.0')
  })

  it('keeps enough context to triage', () => {
    const out = scrubEvent(eventWithSecrets())
    expect(out.request?.url).toBe('https://tour.witus.online/advance/<token>')
    expect(out.exception?.values?.[0]?.type).toBe('Error')
    expect(JSON.stringify(out.breadcrumbs)).toContain(TOUR_ID)
  })

  it('never returns null, because the crash signal itself is the point', () => {
    expect(scrubEvent({} as ErrorEvent)).toBeTruthy()
  })
})
