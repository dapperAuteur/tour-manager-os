// Completes "Sign in with WitUS", both the button's interactive flow and the login page's silent
// `prompt=none` attempt. The decisions (quiet return, state + PKCE, token exchange, userinfo,
// landing path) live in lib/auth/witus-callback.ts and are unit tested; this file wires Next.js
// cookies and Supabase into them. Ported from CentenarianOS app/api/auth/witus/callback/route.ts
// (origin/main c904189).
//
// ACCOUNT LINKING (same as CentOS). The WitUS email is verified by the IdP, so it is the join key:
//   - a Tour user with that email already exists -> that account is signed in (linked by email);
//   - none exists -> one is created with the email confirmed; the on_auth_user_created trigger
//     (migration 005) creates its user_profiles row.
// Then `witus_identities` records witus_sub -> user_id (migration 096). That row is a record of the
// link, not a gate: if migration 096 has not been applied yet, sign-in still works and the failed
// upsert is logged.
//
// NOTE (verify live): the session is minted with admin.generateLink('magiclink') + verifyOtp({
// token_hash }). That is the one step unit tests cannot reach. If sign-in lands on
// /login?error=witus_verify, the likely fix is the verifyOtp `type` ('magiclink' vs 'email') for
// the installed @supabase/supabase-js.
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/observability/logger'
import {
  handleWitusCallback,
  type WitusCallbackFailure,
  type WitusClaims,
} from '@/lib/auth/witus-callback'
import {
  NEXT_PATH_COOKIE,
  STATE_COOKIE,
  VERIFIER_COOKIE,
  witusRedirectUri,
} from '@/lib/auth/witus-sso'
import {
  witusClientCredentials,
  witusEndpoints,
  witusSiteOrigin,
} from '@/lib/auth/witus-sso-server'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const { clientId, clientSecret } = witusClientCredentials()
  const { tokenUrl, userinfoUrl } = witusEndpoints()

  const outcome = await handleWitusCallback(
    {
      search: request.nextUrl.searchParams,
      expectedState: cookieStore.get(STATE_COOKIE)?.value,
      verifier: cookieStore.get(VERIFIER_COOKIE)?.value,
      nextPath: cookieStore.get(NEXT_PATH_COOKIE)?.value,
      redirectUri: witusRedirectUri(witusSiteOrigin()),
      clientId,
      clientSecret,
      tokenUrl,
      userinfoUrl,
    },
    { fetch, establishSession: establishSupabaseSession },
  )

  // Every outcome ends this round trip: the transient cookies are single use.
  for (const name of [STATE_COOKIE, VERIFIER_COOKIE, NEXT_PATH_COOKIE]) {
    cookieStore.set({ name, value: '', maxAge: 0, path: '/' })
  }
  return NextResponse.redirect(new URL(outcome.redirectTo, request.url))
}

/** Find-or-create the Tour user, mint its Supabase session cookies, link the WitUS sub. */
async function establishSupabaseSession({ sub, email }: WitusClaims): Promise<WitusCallbackFailure | null> {
  const admin = createAdminClient()

  // Idempotent: "already registered" is the existing-account case, matched by email below.
  await admin.auth.admin.createUser({ email, email_confirm: true }).catch(() => undefined)

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })
  const tokenHash = linkData?.properties?.hashed_token
  if (linkErr || !tokenHash) return 'witus_session'

  // The cookie-writing server client: verifyOtp sets the Supabase auth cookies on this response.
  const supabase = await createClient()
  const { data: verified, error: verifyErr } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: tokenHash,
  })
  if (verifyErr || !verified.user) return 'witus_verify'

  const { error: linkRowErr } = await admin
    .from('witus_identities')
    .upsert({ user_id: verified.user.id, witus_sub: sub }, { onConflict: 'witus_sub' })
  if (linkRowErr) {
    // No email or sub in the log. The likeliest cause is migration 096 not yet applied.
    logError('witus_identities upsert failed', linkRowErr, { route: '/api/auth/witus/callback' })
  }

  return null
}
