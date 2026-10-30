// "Sign in with WitUS" for Tour Manager OS: pure helpers shared by the API routes, the login page,
// the sign-out controls and the unit tests (lib/auth/witus-sso.test.ts).
//
// Ported from CentenarianOS (gemini/centenarian-os, origin/main at c904189, which includes the
// merged fix/witus-silent-sign-in branch) because Tour runs the same stack: Supabase auth through
// @supabase/ssr, so it cannot use a Better Auth or NextAuth OIDC plugin and runs its own
// authorization-code + PKCE flow against the WitUS identity provider (accounts.witus.online):
//
//   /api/auth/witus/authorize  state + PKCE in short-lived httpOnly cookies, redirect to the IdP
//   /api/auth/witus/callback   token exchange, userinfo, find-or-create the Supabase user by its
//                              verified email, mint the Supabase session, link witus_sub -> user
//
// SILENT SIGN-IN. Once per browser session, a signed-out visitor on /login is sent through the
// authorize route with `prompt=none`. That is a TOP-LEVEL navigation, so the browser carries the
// IdP's SameSite=Lax session cookie even though tour.witus.online and accounts.witus.online are
// different sites. With a live WitUS session the visitor comes back signed in; without one the IdP
// answers `error=login_required` and the callback returns to /login with no message. CentOS used to
// probe the IdP with a cross-site fetch and relabel the button "Continue as <name>"; a cross-site
// fetch never carries a SameSite=Lax cookie, so that probe could only answer "nobody" and was
// removed on 2026-10-29. Tour never had it.
//
// THE LOOP GUARD. Three layers, any one of which stops a second attempt: a browser-session cookie
// (`witus_sso_silent`) written IMMEDIATELY BEFORE leaving for the IdP, the `?sso=tried` marker on
// every bounce back to /login, and `?error=` on /login. `/login?no_sso=1` skips the attempt.
//
// SIGN-OUT (BAM, 2026-10-29, witus task 128 option (b)). "Sign out" ends only Tour's Supabase
// session. A separate, secondary "Sign out of WitUS everywhere" ends the Tour session first and
// then sends the browser to the IdP's end_session_endpoint, which ends the shared WitUS session.
// Other WitUS apps keep their own sessions, which the help text says.
//
// WHITE LABEL. Tour serves verified custom domains for white-label orgs (lib/multi-tenant). None of
// this may appear there: the gate below enables WitUS only on the one host the IdP has registered,
// so a tenant domain, a Vercel preview and localhost render no button, make no silent attempt and
// show no everywhere control.
//
// Pure: no process.env, no next/headers, no window access at module scope, so client components,
// route handlers and vitest can all import it. The env is read in ./witus-sso-server.ts.

/**
 * Default IdP endpoints. These are FALLBACKS, labeled as such (authoritative-values rule): the
 * WITUS_OIDC_*_URL env vars win. They match the live discovery document
 * (https://accounts.witus.online/api/idp/.well-known/openid-configuration, read 2026-10-29), which
 * is the authoritative source if they ever drift.
 */
export const WITUS_OIDC_AUTHORIZE_FALLBACK = 'https://accounts.witus.online/api/idp/oauth2/authorize'
export const WITUS_OIDC_TOKEN_FALLBACK = 'https://accounts.witus.online/api/idp/oauth2/token'
export const WITUS_OIDC_USERINFO_FALLBACK = 'https://accounts.witus.online/api/idp/oauth2/userinfo'

/**
 * Tour's production origin, used when NEXT_PUBLIC_SITE_URL is unset. FALLBACK, not a claim made
 * here: it is the origin the IdP registry has for slug `tour` (gemini/witus
 * lib/identity/clients.ts), this app's metadataBase, and the host that served /login on
 * 2026-10-29. The same fallback is already used by app/api/stripe/webhook and
 * lib/wallet/google-wallet.
 */
export const TOUR_SITE_URL_FALLBACK = 'https://tour.witus.online'

/** The callback path the IdP must have registered for this client (exact match). */
export const WITUS_CALLBACK_PATH = '/api/auth/witus/callback'

/** Transient httpOnly cookies the authorize route sets and the callback consumes. */
export const STATE_COOKIE = 'witus_oauth_state'
export const VERIFIER_COOKIE = 'witus_oauth_verifier'
export const NEXT_PATH_COOKIE = 'witus_oauth_next'

/** Query param marking "this browser already tried the WitUS flow on this page". */
export const SSO_ATTEMPT_PARAM = 'sso'
export const SSO_ATTEMPT_VALUE = 'tried'

/** `/login?no_sso=1` never starts the silent attempt. A testing escape hatch. */
export const NO_SSO_PARAM = 'no_sso'

/**
 * Browser-session cookie (no Max-Age, so it ends when the browser does) recording that this
 * browser already made its one silent attempt. A cookie rather than sessionStorage so a second tab
 * does not repeat the round trip, and so it is still set after a sign-out returns here.
 */
export const SILENT_SSO_COOKIE = 'witus_sso_silent'

/** The login page's "where to go after sign-in" param. Tour's middleware sets it. */
export const LOGIN_NEXT_PARAM = 'redirect'

/** Where a successful sign-in lands when no safe `redirect` was carried. Same as the login form. */
export const DEFAULT_SIGNED_IN_PATH = '/dashboard'

/**
 * IdP errors that mean "nobody is signed in to WitUS here" or "the IdP would have to show a page".
 * For a silent attempt that is the expected answer, not a failure.
 */
const QUIET_SILENT_ERRORS = new Set([
  'login_required',
  'consent_required',
  'interaction_required',
  'account_selection_required',
])

/**
 * Server-resolved WitUS configuration for one request. Every field is off unless this app is a
 * configured WitUS client AND the request is on the registered host: an affordance the visitor
 * cannot complete is worse than none.
 */
export interface WitusSsoConfig {
  /** Show "Sign in with WitUS" and allow the silent attempt. */
  enabled: boolean
  /** Full IdP logout URL for "Sign out of WitUS everywhere", or null to hide that control. */
  signOutEverywhereUrl: string | null
}

export const WITUS_SSO_DISABLED: WitusSsoConfig = { enabled: false, signOutEverywhereUrl: null }

/** `https://tour.witus.online/` -> `https://tour.witus.online`, or null if not an http(s) URL. */
export function normalizeOrigin(siteUrl: string | null | undefined): string | null {
  if (!siteUrl) return null
  try {
    const url = new URL(siteUrl)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return url.origin
  } catch {
    return null
  }
}

/** The redirect_uri both routes send. Must equal what the IdP registered, byte for byte. */
export function witusRedirectUri(siteOrigin: string): string {
  return `${siteOrigin.replace(/\/+$/, '')}${WITUS_CALLBACK_PATH}`
}

/**
 * Decide the WitUS config for one request. Pure, so the gate is tested directly.
 *
 * `requestHost` is the Host header the SERVER saw (never client-supplied data). WitUS is enabled
 * only when it equals the host of the site origin the callback returns to, which keeps it off
 * white-label custom domains, Vercel previews and localhost: none of those is a registered
 * redirect URI, so the IdP would refuse them.
 */
export function witusSsoConfigFor(input: {
  clientId: string | null | undefined
  authorizeUrl: string
  siteUrl: string | null | undefined
  requestHost: string | null | undefined
}): WitusSsoConfig {
  if (!input.clientId) return WITUS_SSO_DISABLED
  const siteOrigin = normalizeOrigin(input.siteUrl)
  if (!siteOrigin || !input.requestHost) return WITUS_SSO_DISABLED
  if (new URL(siteOrigin).host.toLowerCase() !== input.requestHost.trim().toLowerCase()) {
    return WITUS_SSO_DISABLED
  }

  const endSession = endSessionEndpointFromAuthorizeUrl(input.authorizeUrl)
  return {
    enabled: true,
    signOutEverywhereUrl: endSession
      ? witusLogoutUrl(endSession, input.clientId, siteOrigin)
      : null,
  }
}

/**
 * The IdP's RP-initiated logout endpoint, derived from the authorize URL this app is already
 * configured with: `<origin><basePath>/oauth2/endsession`. That is the `end_session_endpoint` the
 * live discovery document advertises (read 2026-10-29), so the IdP host is asserted once.
 */
export function endSessionEndpointFromAuthorizeUrl(
  authorizeUrl: string | null | undefined,
): string | null {
  if (!authorizeUrl) return null
  let parsed: URL
  try {
    parsed = new URL(authorizeUrl)
  } catch {
    return null
  }
  const cut = parsed.pathname.indexOf('/oauth2/authorize')
  if (cut < 0) return null
  return `${parsed.origin}${parsed.pathname.slice(0, cut)}/oauth2/endsession`
}

/**
 * The full logout URL "Sign out of WitUS everywhere" navigates to AFTER the Tour session is gone.
 *
 * `client_id` is required: better-auth's endsession refuses a post_logout_redirect_uri without
 * either a verifiable id_token_hint or a client_id, and Tour keeps no id_token (the callback only
 * uses the access token to read userinfo), so it sends client_id, as the sibling apps do.
 *
 * `post_logout_redirect_uri` must be EXACTLY `<origin>/`, trailing slash included: better-auth
 * exact-matches it against the client's registered redirect URLs, and the IdP registry registers
 * `origin + "/"` for every app.
 */
export function witusLogoutUrl(endSessionEndpoint: string, clientId: string, siteOrigin: string): string {
  const url = new URL(endSessionEndpoint)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('post_logout_redirect_uri', `${siteOrigin.replace(/\/+$/, '')}/`)
  return url.toString()
}

export type SilentSsoSkip = 'not-configured' | 'escape-hatch' | 'already-attempted' | 'already-signed-in' | 'error-shown'

export type SilentSsoDecision = { attempt: true } | { attempt: false; skip: SilentSsoSkip }

/**
 * Should the login page send this browser to the IdP with `prompt=none`?
 *
 * `enabled` is the SERVER-RESOLVED gate. Never re-derive it on the client. `attempted` is the
 * browser-session cookie flag.
 */
export function silentSsoDecision(input: {
  enabled: boolean
  search?: string | null
  attempted?: boolean
  signedIn?: boolean
}): SilentSsoDecision {
  if (!input.enabled) return { attempt: false, skip: 'not-configured' }
  const params = toParams(input.search)
  if (params.get(NO_SSO_PARAM) === '1') return { attempt: false, skip: 'escape-hatch' }
  if (input.signedIn) return { attempt: false, skip: 'already-signed-in' }
  if (input.attempted || params.get(SSO_ATTEMPT_PARAM) === SSO_ATTEMPT_VALUE) {
    return { attempt: false, skip: 'already-attempted' }
  }
  if (params.has('error')) return { attempt: false, skip: 'error-shown' }
  return { attempt: true }
}

/** Does a `document.cookie` string carry the silent-attempt flag? */
export function hasSilentSsoFlag(cookieString: string | null | undefined): boolean {
  if (!cookieString) return false
  return cookieString.split(';').some((part) => part.trim() === `${SILENT_SSO_COOKIE}=1`)
}

/** The `document.cookie` assignment that records the attempt for the rest of the browser session. */
export function silentSsoFlagCookie(secure: boolean): string {
  return `${SILENT_SSO_COOKIE}=1; Path=/; SameSite=Lax${secure ? '; Secure' : ''}`
}

/** Is this IdP error the ordinary "not signed in to WitUS" answer to a silent attempt? */
export function isQuietSilentSsoError(error: string | null | undefined): boolean {
  return typeof error === 'string' && QUIET_SILENT_ERRORS.has(error)
}

/**
 * A same-origin path we are willing to redirect to, or null. Rejects absolute URLs,
 * protocol-relative `//host`, backslash tricks (`/\host`), control characters and absurd lengths,
 * so the carried path can never become an open redirect.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > 512) return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  // eslint-disable-next-line no-control-regex
  if (value.includes('\\') || /[\u0000-\u001F\u007F]/.test(value)) return null
  return value
}

/** Where the login page sends the browser: the same-origin authorize route, interactive or silent. */
export function witusAuthorizePath(from: string | null | undefined, silent = false): string {
  const params = new URLSearchParams()
  if (silent) params.set('prompt', 'none')
  const next = safeNextPath(from)
  if (next) params.set('from', next)
  const query = params.toString()
  return query ? `/api/auth/witus/authorize?${query}` : '/api/auth/witus/authorize'
}

/**
 * The quiet return to /login after the IdP said "nobody here": no error, the loop-guard marker,
 * and the original `redirect` so a password sign-in still lands where the visitor was going.
 */
export function quietLoginPath(from: string | null | undefined): string {
  const next = safeNextPath(from)
  return withAttemptMarker(
    next ? `/login?${LOGIN_NEXT_PARAM}=${encodeURIComponent(next)}` : '/login',
  )
}

/**
 * The IdP authorize URL. One builder for the interactive button and the silent attempt, so client
 * id, callback, state and PKCE are always built the same way; `silent` only adds `prompt=none`.
 */
export function buildWitusAuthorizeUrl(input: {
  authorizeUrl: string
  clientId: string
  redirectUri: string
  state: string
  codeChallenge: string
  silent?: boolean
}): string {
  const authUrl = new URL(input.authorizeUrl)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', input.clientId)
  authUrl.searchParams.set('redirect_uri', input.redirectUri)
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', input.state)
  authUrl.searchParams.set('code_challenge', input.codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  if (input.silent) authUrl.searchParams.set('prompt', 'none')
  return authUrl.toString()
}

/** Add the one-shot marker to a same-origin path, keeping any query it already has. */
export function withAttemptMarker(path: string): string {
  const [beforeHash, ...hashRest] = path.split('#')
  const hash = hashRest.length > 0 ? `#${hashRest.join('#')}` : ''
  const [pathname, ...queryRest] = beforeHash.split('?')
  const params = new URLSearchParams(queryRest.join('?'))
  params.set(SSO_ATTEMPT_PARAM, SSO_ATTEMPT_VALUE)
  return `${pathname}?${params.toString()}${hash}`
}

function toParams(search: string | null | undefined): URLSearchParams {
  if (typeof search !== 'string' || search === '') return new URLSearchParams()
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
}

/**
 * Plain-language message for a `?error=witus_*` code on /login, or null for any other value.
 * Codes come from the URL, so only these fixed strings are ever rendered.
 */
export function witusErrorMessage(code: string | null | undefined): string | null {
  switch (code) {
    case 'witus_not_configured':
      return 'Sign in with WitUS is not available here. Log in with your email instead.'
    case 'witus_state':
      return 'Your WitUS sign-in expired or was interrupted. Please try again.'
    case 'witus_token':
    case 'witus_userinfo':
    case 'witus_claims':
      return 'WitUS could not confirm your account. Please try again, or log in with your email.'
    case 'witus_session':
    case 'witus_verify':
      return 'We could not sign you in to Tour Manager OS. Please try again, or log in with your email.'
    default:
      return null
  }
}

// ── Sign-out (BAM, 2026-10-29, witus task 128 option (b)) ─────────────────────────────────────

/** Exact accessible names and help text. Pinned by the tests. */
export const SIGN_OUT_LABEL = 'Sign out'
export const SIGN_OUT_EVERYWHERE_LABEL = 'Sign out of WitUS everywhere'
export const SIGN_OUT_EVERYWHERE_HELP =
  'Also signs you out of WitUS. Other WitUS apps you are signed in to stay signed in until you sign out of them.'
export const SIGNING_OUT_LABEL = 'Signing out…'

/**
 * What "Sign out of WitUS everywhere" does, with the browser pieces passed in so the order can be
 * tested without a DOM.
 *
 * ORDER IS THE SAFETY PROPERTY. The Tour session is destroyed first (awaited), so if the IdP is
 * unreachable or refuses the logout, the person is still signed out HERE. An error from the local
 * sign-out is swallowed so the WitUS sign-out the person asked for still happens.
 */
export async function signOutEverywhere(deps: {
  signOutLocal: () => Promise<unknown>
  navigate: (url: string) => void
  logoutUrl: string
}): Promise<void> {
  try {
    await deps.signOutLocal()
  } catch {
    // Swallowed on purpose: see above.
  }
  deps.navigate(deps.logoutUrl)
}
