import type { ErrorEvent } from '@sentry/nextjs'

/**
 * Sentry `beforeSend` scrubber for Tour Manager OS.
 *
 * Why this file exists
 * --------------------
 * A crash report is shipped to a third party (Better Stack, via the Sentry SDK). It must never
 * carry a working credential or a person's identity. In THIS app the credentials that travel in
 * URLs are:
 *
 *   - `/advance/<uuid>`            the anonymous advance-sheet link. Anyone holding it can read and
 *                                  submit a venue's advance without an account.
 *   - `/auth/callback?code=...`    the Supabase PKCE code exchange (account takeover).
 *   - `/api/oauth/gmail/*`         Google OAuth `code` + `state` (mailbox access).
 *   - `/tickets/<id>?token=...`    the HMAC ticket signature (lib/tickets/sign.ts).
 *   - `#access_token=...`          Supabase can put session tokens in the URL fragment.
 *
 * and the credentials that travel in free text are Supabase JWTs, `tm_live_*` API keys
 * (lib/api/auth.ts), Stripe keys, the Mailgun key, and the Shippo token.
 *
 * The hard part is that this app's PUBLIC resource ids are UUIDs too, so "redact anything that
 * looks random" would gut the report: `/tours/<uuid>`, `/shows/<uuid>`, `/venues/<uuid>`,
 * `/photos/<uuid>` are ordinary ids protected by RLS or a separate signature, and a triage report
 * that hides them tells you nothing about which page broke. So the rule here is BY PATH, not by
 * shape: under a credential-bearing prefix every id-shaped segment and every query value is masked;
 * everywhere else UUIDs and kebab-case slugs are preserved and only genuinely opaque blobs
 * (long strings with no word structure, e.g. raw hex) are masked.
 *
 * It never returns null: we still want the crash signal, just without the credentials.
 *
 * Pure and dependency-free so it is directly unit-testable (see sentry-scrub.test.ts).
 */

const TOKEN_MASK = '<token>'
/** Query-param replacement. Deliberately plain so URLSearchParams does not percent-encode it. */
const PARAM_MASK = 'redacted'
const URL_MASK = '<redacted url>'

/**
 * Path prefixes that are credential-redemption surfaces by construction. Under these, EVERY query
 * value and every id-shaped segment is masked, whatever it looks like.
 */
const SECRET_PATH_RE =
  /^\/(advance|auth|api\/auth|api\/oauth|reset|reset-password|set-password|confirm|activate|invite|join|unsubscribe)(\/|$)/i

/**
 * Query-param names that carry (or plausibly carry) a bearer secret or a person's contact details.
 * Matched case-insensitively as a substring, so `access_token`, `apiKey`, `purchaser_email` all
 * trip it. `state` is deliberately ABSENT: it is a US state in this app's venue and show filters
 * far more often than it is an OAuth nonce, and the OAuth routes are covered by SECRET_PATH_RE.
 */
const SECRET_PARAM_RE =
  /(token|secret|code|otp|passcode|password|pwd|pin|key|jwt|sig|signature|hash|auth|credential|session|magic|invite|nonce|mail|phone)/i

/**
 * A path segment that is an id or token: eight or more url-safe characters containing at least one
 * digit. The digit requirement is what keeps real route words (`callback`, `advance`, `checkout`)
 * readable while still catching every UUID and hex token. Only applied under SECRET_PATH_RE.
 */
const SECRET_SEGMENT_RE = /^(?=.*\d)[A-Za-z0-9_-]{8,}$/

/**
 * A segment that is opaque ANYWHERE, credential path or not: 24+ url-safe characters with no
 * kebab-case word structure. The negative lookahead preserves both human slugs
 * (`getting-started-with-advances`) and UUIDs (`9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`), which are
 * public resource ids here, while still masking a bare 32/64-character hex or base64url blob.
 */
const OPAQUE_SEGMENT_RE =
  /^(?=[A-Za-z0-9_-]{24,}$)(?![a-z0-9]+(?:-[a-z0-9]+)+$)[A-Za-z0-9_-]+$/

/** Absolute http(s) URLs. Trailing punctuation is excluded so prose survives around them. */
const URL_RE = /https?:\/\/[^\s<>"')\]]+/g

/**
 * A ROOT-RELATIVE path quoted inside a message or a breadcrumb, e.g. `GET /advance/<uuid> failed`.
 * This is the form App Router navigation and fetch breadcrumbs use, so without it the browser SDK
 * would happily ship `/advance/<token>` in a breadcrumb even though request.url was scrubbed.
 * Running it over stack-frame paths is harmless: `/var/task/.next/server/...` has no credential
 * segment, so every part of it is preserved.
 *
 * The leading boundary is a CONSUMING group, not a lookbehind. This file is imported by
 * instrumentation-client.ts, so it is parsed in the browser, and lookbehind is a SyntaxError on
 * iOS Safari below 16.4. A regex literal that fails to parse takes the whole chunk down, and it
 * would do so even with no DSN set, which would turn an inert feature into an outage on old
 * phones. Same reason applies to SECRET_LABEL_RE below.
 */
const PATH_RE =
  /(^|[^A-Za-z0-9_])((?:\/[A-Za-z0-9._~%!$&'()*+,;=:@-]+)+(?:\?[A-Za-z0-9._~%!$&'()*+,;=:@/-]*)?)/g

/**
 * Bearer secrets that can appear in any free text: an exception message, a log line, a stack frame.
 * Ordered so the specific formats win before the generic `Bearer` and email rules.
 */
const TEXT_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  // Supabase access / service-role JWTs (also covers any other JWT we ever log).
  [/\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]+/g, '<jwt>'],
  // Public API keys minted by lib/api/auth.ts.
  [/\btm_(?:live|test)_[A-Za-z0-9]{16,}/g, '<api-key>'],
  [/\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{10,}/g, '<stripe-key>'],
  [/\bwhsec_[A-Za-z0-9]{10,}/g, '<stripe-webhook-secret>'],
  [/\bkey-[a-f0-9]{32}\b/g, '<mailgun-key>'],
  [/\bshippo_(?:live|test)_[A-Za-z0-9]{16,}/g, '<shippo-token>'],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, 'Bearer <redacted>'],
  [/\bBasic\s+[A-Za-z0-9+/=]{12,}/gi, 'Basic <redacted>'],
  // Anyone's address: venue contacts, purchasers, crew. Last, so it cannot eat part of a key.
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '<email>'],
]

/**
 * A raw secret introduced by its label: `password: hunter2`, `api_key = tm_live_x`,
 * `SUPABASE_SERVICE_ROLE_KEY=...`. The separator is required, otherwise prose like "pin the
 * setlist to the wall" would be mangled.
 *
 * The boundaries are over `[A-Za-z0-9]`, NOT `\b`. That is deliberate: `_` is a word character, so
 * `\bsecret\b` never matches inside `STRIPE_WEBHOOK_SECRET`, which is exactly the shape every
 * leaked env var has. Allowing `_` on either side is what makes env-var names match. The leading
 * boundary consumes rather than looking behind, for the browser-parsing reason given on PATH_RE.
 */
const SECRET_LABEL_RE =
  /(^|[^A-Za-z0-9])(pin|password|passcode|api[ _-]?key|anon[ _-]?key|service[ _-]?role[ _-]?key|signing[ _-]?secret|webhook[ _-]?secret|secret|access[ _-]?token|refresh[ _-]?token|auth[ _-]?token|one[- ]?time code|verification code|security code)(?![A-Za-z0-9])\s*(?:is|:|=|->)\s*['"]?([^\s'",;}]{3,})/gi

function maskSegment(segment: string, secretPath: boolean): string {
  if (!segment) return segment
  if (secretPath && SECRET_SEGMENT_RE.test(segment)) return TOKEN_MASK
  if (OPAQUE_SEGMENT_RE.test(segment)) return TOKEN_MASK
  return segment
}

/**
 * Apply the known-secret-format rules and the labelled-secret rule to a fragment of text.
 *
 * Split out from scrubText so the URL and query passes can reuse it WITHOUT recursing back into the
 * URL pass (a value like `?next=/a?b=/c` would otherwise bounce between the two).
 */
function scrubSecretFormats(input: string): string {
  let out = input

  for (const [pattern, replacement] of TEXT_PATTERNS) {
    out = out.replace(pattern, replacement)
  }

  return out.replace(
    SECRET_LABEL_RE,
    (_match, before: string, label: string, value: string) =>
      `${before}${label}: ${value.startsWith('<') ? value : '<redacted>'}`,
  )
}

/**
 * Mask a query string by parameter NAME, then run the known-secret-format rules over whatever
 * survived. Values are re-joined DECODED on purpose: round-tripping through
 * `URLSearchParams.toString()` would percent-encode them, and `%40` would then hide an email
 * address from the format rules.
 */
function scrubParams(search: string, secretPath: boolean): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  return Array.from(params.entries())
    .map(([key, value]) =>
      secretPath || SECRET_PARAM_RE.test(key)
        ? `${key}=${PARAM_MASK}`
        : `${key}=${scrubSecretFormats(value)}`,
    )
    .join('&')
}

/**
 * Scrub a path + query + fragment, keeping enough of it to triage. Accepts the pathname-onward
 * portion only, so it works for both absolute URLs and the relative paths that App Router
 * navigation breadcrumbs record.
 */
function scrubPath(pathname: string, search: string, hash: string): string {
  const secretPath = SECRET_PATH_RE.test(pathname)

  const path = pathname
    .split('/')
    .map((seg) => maskSegment(seg, secretPath))
    .join('/')

  let query = ''
  if (search && search !== '?') {
    const serialized = scrubParams(search, secretPath)
    if (serialized) query = `?${serialized}`
  }

  // Supabase's implicit flow can hand back `#access_token=...`. A fragment carrying key=value is
  // never a plain anchor, so drop it wholesale; a bare `#section` anchor is harmless and kept.
  let fragment = ''
  if (hash && hash !== '#') {
    fragment = hash.includes('=') ? '#<redacted>' : hash
  }

  return `${path}${query}${fragment}`
}

/**
 * Scrub a value that is known to be a URL or a URL path (`request.url`, a navigation breadcrumb).
 * Absolute URLs keep their origin, relative paths stay relative.
 */
export function scrubUrl(raw: string): string {
  if (raw.startsWith('/')) {
    const [pathAndQuery, ...hashRest] = raw.split('#')
    const [pathname, ...queryRest] = pathAndQuery.split('?')
    const search = queryRest.length ? `?${queryRest.join('?')}` : ''
    const hash = hashRest.length ? `#${hashRest.join('#')}` : ''
    return scrubPath(pathname, search, hash)
  }

  try {
    const url = new URL(raw)
    return `${url.origin}${scrubPath(url.pathname, url.search, url.hash)}`
  } catch {
    // Cannot reason about it, so do not forward it. Redact when unsure.
    return URL_MASK
  }
}

/**
 * Scrub a BARE query string, i.e. `token=abc&next=/today` with no path and no `?` in front.
 *
 * This exists because Sentry carries `request.query_string` as a field SEPARATE from
 * `request.url`, and a bare query string is not a parseable URL and does not start with `/`, so a
 * URL-only or path-only redaction pass sails straight past it and ships `token=...` verbatim. The
 * path context that `scrubUrl` relies on is absent here, so every parameter is judged on its name
 * alone via SECRET_PARAM_RE.
 */
export function scrubQueryString(input: string): string {
  const raw = input.startsWith('?') ? input.slice(1) : input
  if (!raw) return input

  // URLSearchParams never throws, it just yields nothing useful for non-query text. If it found no
  // pair at all, fall back to the free-text pass rather than returning something empty or wrong.
  if (Array.from(new URLSearchParams(raw).keys()).length === 0) return scrubText(input)

  // secretPath is false: a bare query string carries no path context, so each parameter is judged
  // on its name alone.
  const serialized = scrubParams(raw, false)
  return input.startsWith('?') ? `?${serialized}` : serialized
}

/**
 * Scrub free text: embedded URLs, then quoted relative paths, then every known secret format, then
 * labelled secrets.
 *
 * KNOWN AND DELIBERATE LIMIT: a BARE uuid sitting in prose with no path around it is left alone,
 * because at that point it is indistinguishable from `tour <uuid> not found`, which is the single
 * most useful line in a triage report. Credentials in this app travel as paths and query values,
 * both of which are covered above. If a future code path ever puts a raw advance token into an
 * exception message, quote the path (`/advance/<token>`) rather than the bare id.
 */
export function scrubText(input: string): string {
  let out = input.replace(URL_RE, (match) => scrubUrl(match))
  out = out.replace(PATH_RE, (_match, before: string, path: string) => `${before}${scrubUrl(path)}`)
  return scrubSecretFormats(out)
}

/** Header names dropped outright: they are credentials, never triage signal. */
const DROPPED_HEADERS = [
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'apikey',
  'x-supabase-auth',
  'stripe-signature',
]

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.message) event.message = scrubText(event.message)

  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = scrubText(ex.value)
  }

  // Never ship the account identity or the network origin.
  if (event.user) {
    delete event.user.email
    delete event.user.ip_address
    delete event.user.username
  }

  // Request context: keep a scrubbed URL for triage, drop the credential-bearing parts.
  if (event.request) {
    if (typeof event.request.url === 'string') {
      event.request.url = scrubUrl(event.request.url)
    }
    // A SEPARATE field from url, and a bare query string is neither a parseable URL nor a path, so
    // it needs its own pass or `token=...` ships verbatim.
    if (typeof event.request.query_string === 'string') {
      event.request.query_string = scrubQueryString(event.request.query_string)
    }
    delete event.request.cookies

    const headers = event.request.headers as Record<string, string> | undefined
    if (headers) {
      for (const name of DROPPED_HEADERS) delete headers[name]
      for (const [name, value] of Object.entries(headers)) {
        if (typeof value === 'string') headers[name] = scrubText(value)
      }
    }

    // A request body is the densest PII we hold (advance sheets, purchaser details). Sentry only
    // attaches it when explicitly configured, but scrub it if it ever shows up as a string.
    if (typeof event.request.data === 'string') {
      event.request.data = scrubText(event.request.data)
    }
  }

  // Browser breadcrumbs are the quiet leak: the SDK records every fetch/navigation URL, which is
  // exactly where `/advance/<token>` and `?token=` live.
  for (const crumb of event.breadcrumbs ?? []) {
    if (typeof crumb.message === 'string') crumb.message = scrubText(crumb.message)
    const data = crumb.data as Record<string, unknown> | undefined
    if (!data) continue
    for (const key of ['url', 'to', 'from']) {
      const value = data[key]
      if (typeof value === 'string') data[key] = scrubUrl(value)
    }
  }

  return event
}
