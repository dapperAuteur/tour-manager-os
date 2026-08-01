/**
 * Which request paths a signed-out visitor may reach.
 *
 * This lives outside middleware.ts so it can be unit tested directly. The rule it encodes was
 * broken from the day the auth gate was written: the public list held `'/'` and was matched with
 * `pathname === path || pathname.startsWith(path)`. Every pathname starts with `'/'`, so the
 * "is this public?" answer was unconditionally yes and the login redirect below it never ran on a
 * single request. Splitting exact matches from prefix matches is what makes `'/'` mean the root
 * and only the root.
 */

/** Public pages that match the whole pathname and nothing beneath it. */
export const PUBLIC_EXACT_PATHS = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/roadmap',
  '/features',
  '/wellness-resources',
  // Not pages, but served through the middleware because the matcher only excludes _next,
  // favicon.ico and image extensions. Turning the gate on without these would have bounced
  // every crawler to /login (app/robots.ts, app/sitemap.ts) and broken service-worker
  // registration for push, since a redirect on the worker script fails registration outright.
  '/robots.txt',
  '/sitemap.xml',
  '/sw.js',
] as const

/**
 * Public sub-trees. Every entry must end in `'/'` (or be a complete leaf path like
 * `/auth/callback`) so a prefix can never swallow an unrelated route, and no entry may be `'/'`
 * itself. `assertPrefixesAreSafe` below is the tripwire for both.
 *
 * `/advance/` is load-bearing: the advance sheet is a bearer-token page emailed to a venue
 * contact who has no account and never will. Gating it would break every advance in flight.
 */
export const PUBLIC_PATH_PREFIXES = [
  '/auth/callback',
  '/advance/',
  '/for/',
  '/features/',
  '/shows/',
  '/store/',
  '/photos/',
  '/tickets/',
] as const

/**
 * Route handlers are never bounced to the login page. A 302 to an HTML form is useless to a
 * Stripe webhook, a `Bearer tmos_...` API client, a Vercel cron probe, or a `fetch()` expecting
 * JSON, and it would turn a clean 401 into a confusing 200-with-HTML. Authentication under
 * `app/api` is the handler's own job, and the audit behind this change confirmed every handler
 * touching tour, venue, show, ticket, settlement, or advance data already does it (session +
 * 401, API key, HMAC signature, or CRON_SECRET). `/api/health` stays reachable through this
 * branch on every host, which is what the uptime probe needs.
 */
export function isApiRoute(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/')
}

export function isPublicPath(pathname: string): boolean {
  if ((PUBLIC_EXACT_PATHS as readonly string[]).includes(pathname)) return true
  return (PUBLIC_PATH_PREFIXES as readonly string[]).some((prefix) =>
    pathname.startsWith(prefix),
  )
}

/** True when middleware should send a signed-out visitor to /login. */
export function requiresAuth(pathname: string): boolean {
  if (isApiRoute(pathname)) return false
  return !isPublicPath(pathname)
}

/**
 * Guard against the original bug reappearing: a prefix of `'/'` (or an empty string) makes every
 * path public again. Exported for the test suite rather than run at import time so middleware
 * stays allocation-free on the hot path.
 */
export function assertPrefixesAreSafe(): void {
  for (const prefix of PUBLIC_PATH_PREFIXES) {
    if (prefix.length < 2) {
      throw new Error(
        `Unsafe public prefix ${JSON.stringify(prefix)}: it would make every path public.`,
      )
    }
  }
}
