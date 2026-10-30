// Starts "Sign in with WitUS": generate state + PKCE, keep them in short-lived httpOnly cookies,
// and redirect to the WitUS IdP's authorize endpoint. The IdP returns to /api/auth/witus/callback.
// Ported from CentenarianOS app/api/auth/witus/authorize/route.ts (origin/main c904189).
//
// Optional query params, both from the login page:
//   ?prompt=none  the silent attempt (lib/auth/witus-sso.ts): same client, callback, state and
//                 PKCE plus prompt=none, so the IdP answers at once with a code or with
//                 error=login_required instead of showing its login page. Any other value is
//                 ignored.
//   ?from=/path   where to land after sign-in; validated to a same-origin path and carried across
//                 the round trip in a transient httpOnly cookie.
import crypto from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import {
  NEXT_PATH_COOKIE,
  STATE_COOKIE,
  VERIFIER_COOKIE,
  buildWitusAuthorizeUrl,
  safeNextPath,
  withAttemptMarker,
  witusRedirectUri,
} from '@/lib/auth/witus-sso'
import {
  resolveWitusSsoConfig,
  witusClientCredentials,
  witusEndpoints,
  witusSiteOrigin,
} from '@/lib/auth/witus-sso-server'

const b64url = (buf: Buffer) => buf.toString('base64url')

export async function GET(request: NextRequest) {
  const { clientId } = witusClientCredentials()
  // Off unless configured AND on the registered host (never a white-label domain or a preview).
  if (!clientId || !resolveWitusSsoConfig(request.headers.get('host')).enabled) {
    // `?sso=tried` keeps the login page from starting a silent attempt on the bounce.
    return NextResponse.redirect(
      new URL(withAttemptMarker('/login?error=witus_not_configured'), request.url),
    )
  }

  const state = b64url(crypto.randomBytes(16))
  const verifier = b64url(crypto.randomBytes(32))
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest())

  const authUrl = buildWitusAuthorizeUrl({
    authorizeUrl: witusEndpoints().authorizeUrl,
    clientId,
    // Must EXACTLY match the redirect URI the IdP registered for client `witus-tour`.
    redirectUri: witusRedirectUri(witusSiteOrigin()),
    state,
    codeChallenge: challenge,
    silent: request.nextUrl.searchParams.get('prompt') === 'none',
  })

  const res = NextResponse.redirect(authUrl)
  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 600, // 10 minutes
  }
  res.cookies.set(STATE_COOKIE, state, cookieOpts)
  res.cookies.set(VERIFIER_COOKIE, verifier, cookieOpts)
  const next = safeNextPath(request.nextUrl.searchParams.get('from'))
  if (next) res.cookies.set(NEXT_PATH_COOKIE, next, cookieOpts)
  else res.cookies.set(NEXT_PATH_COOKIE, '', { ...cookieOpts, maxAge: 0 })
  return res
}
