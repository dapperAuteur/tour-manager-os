// The decision logic of the "Sign in with WitUS" callback (app/api/auth/witus/callback/route.ts),
// split out so vitest can run it with a fake fetch and a fake session minter
// (lib/auth/witus-callback.test.ts). The route keeps the Next.js and Supabase wiring.
// Ported from CentenarianOS lib/auth/witus-callback.ts (origin/main c904189).
//
// Order matters:
//   1. A silent attempt (`prompt=none`) that finds no WitUS session comes back as
//      `?error=login_required` (or consent/interaction/account_selection_required) and, from the
//      live IdP, WITHOUT `state`. That is the ordinary "not signed in to WitUS" answer, so it
//      returns to /login with no message. It grants nothing, so it needs no state check.
//   2. Everything else goes through state + PKCE, token exchange, userinfo, then the injected
//      session minter. Each failure returns to `/login?error=<code>&sso=tried`.
//   3. Success lands on the validated path the authorize route stashed, else /dashboard.
//
// One addition over CentOS: a userinfo answer that says `email_verified: false` is refused. The
// IdP signs people in by emailed link, so its emails are verified, but the email is what links a
// WitUS identity to an existing Tour account, so an unverified one must never reach that step.

import { DEFAULT_SIGNED_IN_PATH, isQuietSilentSsoError, quietLoginPath, safeNextPath, withAttemptMarker } from './witus-sso'

export type WitusCallbackFailure =
  | 'witus_state'
  | 'witus_token'
  | 'witus_userinfo'
  | 'witus_claims'
  | 'witus_session'
  | 'witus_verify'

export interface WitusCallbackInput {
  /** The callback's query string. */
  search: URLSearchParams
  /** Transient cookies set by the authorize route. */
  expectedState?: string
  verifier?: string
  nextPath?: string
  /** Must equal the redirect_uri the authorize route sent. */
  redirectUri: string
  clientId: string
  clientSecret: string
  tokenUrl: string
  userinfoUrl: string
}

export interface WitusClaims {
  sub: string
  email: string
}

export interface WitusCallbackDeps {
  fetch: typeof fetch
  /**
   * Find-or-create the Tour user for these verified claims, mint the Supabase session cookies,
   * and link `sub`. Returns null on success or the failure code to show.
   */
  establishSession(claims: WitusClaims): Promise<WitusCallbackFailure | null>
}

export type WitusCallbackOutcome =
  | { kind: 'quiet'; redirectTo: string }
  | { kind: 'failed'; reason: WitusCallbackFailure; redirectTo: string }
  | { kind: 'signed-in'; redirectTo: string }

export async function handleWitusCallback(
  input: WitusCallbackInput,
  deps: WitusCallbackDeps,
): Promise<WitusCallbackOutcome> {
  const { search } = input

  if (isQuietSilentSsoError(search.get('error'))) {
    return { kind: 'quiet', redirectTo: quietLoginPath(input.nextPath) }
  }

  const fail = (reason: WitusCallbackFailure): WitusCallbackOutcome => ({
    kind: 'failed',
    reason,
    // `?sso=tried` keeps the login page from starting another silent attempt.
    redirectTo: withAttemptMarker(`/login?error=${reason}`),
  })

  const code = search.get('code')
  const state = search.get('state')
  if (!code || !state || !input.expectedState || state !== input.expectedState || !input.verifier) {
    return fail('witus_state')
  }
  if (!input.clientId || !input.clientSecret) return fail('witus_token')

  // 1. Exchange the authorization code (+ PKCE verifier) for tokens.
  let tokens: { access_token?: unknown }
  try {
    const tokenRes = await deps.fetch(input.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: input.redirectUri,
        client_id: input.clientId,
        client_secret: input.clientSecret,
        code_verifier: input.verifier,
      }),
      cache: 'no-store',
    })
    if (!tokenRes.ok) return fail('witus_token')
    tokens = (await tokenRes.json()) as { access_token?: unknown }
  } catch {
    return fail('witus_token')
  }
  if (typeof tokens.access_token !== 'string' || !tokens.access_token) return fail('witus_token')

  // 2. Read claims from userinfo (server to server, so there is no client-side JWT to verify).
  let claims: { sub?: unknown; email?: unknown; email_verified?: unknown }
  try {
    const userinfoRes = await deps.fetch(input.userinfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: 'no-store',
    })
    if (!userinfoRes.ok) return fail('witus_userinfo')
    claims = (await userinfoRes.json()) as typeof claims
  } catch {
    return fail('witus_userinfo')
  }
  if (typeof claims.sub !== 'string' || !claims.sub) return fail('witus_claims')
  if (typeof claims.email !== 'string' || !claims.email.includes('@')) return fail('witus_claims')
  if (claims.email_verified === false) return fail('witus_claims')

  // 3. Mint the Tour session.
  const sessionFailure = await deps.establishSession({
    sub: claims.sub,
    email: claims.email.trim().toLowerCase(),
  })
  if (sessionFailure) return fail(sessionFailure)

  return { kind: 'signed-in', redirectTo: safeNextPath(input.nextPath) ?? DEFAULT_SIGNED_IN_PATH }
}
