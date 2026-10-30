import { describe, expect, it } from 'vitest'
import { handleWitusCallback, type WitusCallbackInput, type WitusClaims } from './witus-callback'

// The "Sign in with WitUS" callback decisions (lib/auth/witus-callback.ts) with a fake fetch and a
// fake session minter: state + PKCE checks, the quiet silent-attempt return, token exchange,
// userinfo claims, and where a successful sign-in lands. Ported from CentenarianOS
// tests/unit/witus-silent-sso.test.ts. No network, no database; every value is made up.

function input(query: string, extra: Partial<WitusCallbackInput> = {}): WitusCallbackInput {
  return {
    search: new URLSearchParams(query),
    expectedState: 'state-1',
    verifier: 'verifier-1',
    redirectUri: 'https://tour.example/api/auth/witus/callback',
    clientId: 'client-x',
    clientSecret: 'secret-x',
    tokenUrl: 'https://idp.example/token',
    userinfoUrl: 'https://idp.example/userinfo',
    ...extra,
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

const neverFetch = (async () => {
  throw new Error('fetch must not be called')
}) as typeof fetch
const neverSession = async () => {
  throw new Error('establishSession must not be called')
}

function idp(userinfo: Record<string, unknown>) {
  return (async (url: string | URL | Request) =>
    String(url).endsWith('/token') ? json({ access_token: 'at-1' }) : json(userinfo)) as typeof fetch
}

describe('the quiet return from a silent attempt', () => {
  it('login_required returns to /login with no error, no IdP calls, the marker and the redirect', async () => {
    // The live IdP sends no state with this error (checked by CentOS on 2026-10-29).
    const outcome = await handleWitusCallback(
      input('error=login_required&error_description=Authentication+required', { nextPath: '/tours/1' }),
      { fetch: neverFetch, establishSession: neverSession },
    )
    expect(outcome.kind).toBe('quiet')
    const back = new URL(outcome.redirectTo, 'https://tour.example')
    expect(back.pathname).toBe('/login')
    expect(back.searchParams.get('error')).toBeNull()
    expect(back.searchParams.get('sso')).toBe('tried')
    expect(back.searchParams.get('redirect')).toBe('/tours/1')
  })

  it('consent, interaction and account selection answers are quiet too', async () => {
    for (const error of ['consent_required', 'interaction_required', 'account_selection_required']) {
      const outcome = await handleWitusCallback(input(`error=${error}`), {
        fetch: neverFetch,
        establishSession: neverSession,
      })
      expect(outcome).toEqual({ kind: 'quiet', redirectTo: '/login?sso=tried' })
    }
  })

  it('any other IdP error is a failure', async () => {
    const outcome = await handleWitusCallback(input('error=access_denied'), {
      fetch: neverFetch,
      establishSession: neverSession,
    })
    expect(outcome).toEqual({
      kind: 'failed',
      reason: 'witus_state',
      redirectTo: '/login?error=witus_state&sso=tried',
    })
  })
})

describe('state and PKCE', () => {
  it('a forged state never reaches the IdP', async () => {
    const outcome = await handleWitusCallback(input('code=c&state=forged'), {
      fetch: neverFetch,
      establishSession: neverSession,
    })
    expect(outcome.kind === 'failed' && outcome.reason).toBe('witus_state')
  })

  it('a missing state cookie or verifier cookie fails the same way', async () => {
    for (const extra of [{ expectedState: undefined }, { verifier: undefined }]) {
      const outcome = await handleWitusCallback(input('code=c&state=state-1', extra), {
        fetch: neverFetch,
        establishSession: neverSession,
      })
      expect(outcome.kind === 'failed' && outcome.reason).toBe('witus_state')
    }
  })

  it('a missing code fails', async () => {
    const outcome = await handleWitusCallback(input('state=state-1'), {
      fetch: neverFetch,
      establishSession: neverSession,
    })
    expect(outcome.kind === 'failed' && outcome.reason).toBe('witus_state')
  })

  it('an unconfigured client secret fails before any IdP call', async () => {
    const outcome = await handleWitusCallback(input('code=c&state=state-1', { clientSecret: '' }), {
      fetch: neverFetch,
      establishSession: neverSession,
    })
    expect(outcome.kind === 'failed' && outcome.reason).toBe('witus_token')
  })
})

describe('a code completes sign-in', () => {
  it('exchanges the code with the PKCE verifier, reads userinfo, mints the session, lands on the path', async () => {
    const calls: { url: string; init?: RequestInit }[] = []
    const fakeFetch = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init })
      if (String(url) === 'https://idp.example/token') return json({ access_token: 'at-1' })
      if (String(url) === 'https://idp.example/userinfo') {
        return json({ sub: 'sub-1', email: 'Person@Example.com', email_verified: true })
      }
      return json({}, 404)
    }) as typeof fetch
    const sessions: WitusClaims[] = []

    const outcome = await handleWitusCallback(input('code=code-1&state=state-1', { nextPath: '/tours/1' }), {
      fetch: fakeFetch,
      establishSession: async (claims) => {
        sessions.push(claims)
        return null
      },
    })

    expect(outcome).toEqual({ kind: 'signed-in', redirectTo: '/tours/1' })
    // The email is the account-linking key, so it is normalized before it gets there.
    expect(sessions).toEqual([{ sub: 'sub-1', email: 'person@example.com' }])
    const body = new URLSearchParams(String(calls[0].init?.body))
    expect(body.get('grant_type')).toBe('authorization_code')
    expect(body.get('code')).toBe('code-1')
    expect(body.get('code_verifier')).toBe('verifier-1')
    expect(body.get('redirect_uri')).toBe('https://tour.example/api/auth/witus/callback')
    expect(body.get('client_id')).toBe('client-x')
    expect((calls[1].init?.headers as Record<string, string>).Authorization).toBe('Bearer at-1')
  })

  it('lands on /dashboard with no stashed path, and ignores an unsafe one', async () => {
    for (const nextPath of [undefined, '//evil.example', 'https://evil.example']) {
      const outcome = await handleWitusCallback(input('code=c&state=state-1', { nextPath }), {
        fetch: idp({ sub: 'sub-1', email: 'person@example.com' }),
        establishSession: async () => null,
      })
      expect(outcome).toEqual({ kind: 'signed-in', redirectTo: '/dashboard' })
    }
  })
})

describe('failures keep their codes', () => {
  it('a refused token exchange is witus_token', async () => {
    const outcome = await handleWitusCallback(input('code=c&state=state-1'), {
      fetch: (async () => json({ error: 'invalid_grant' }, 400)) as typeof fetch,
      establishSession: neverSession,
    })
    expect(outcome.kind === 'failed' && outcome.reason).toBe('witus_token')
  })

  it('a failed userinfo call is witus_userinfo', async () => {
    const outcome = await handleWitusCallback(input('code=c&state=state-1'), {
      fetch: (async (url: string | URL | Request) =>
        String(url).endsWith('/token') ? json({ access_token: 'at-1' }) : json({}, 401)) as typeof fetch,
      establishSession: neverSession,
    })
    expect(outcome.kind === 'failed' && outcome.reason).toBe('witus_userinfo')
  })

  it('missing claims or an explicitly unverified email never reach account linking', async () => {
    for (const userinfo of [
      { email: 'person@example.com' },
      { sub: 'sub-1' },
      { sub: 'sub-1', email: 'not-an-email' },
      { sub: 'sub-1', email: 'person@example.com', email_verified: false },
    ]) {
      const outcome = await handleWitusCallback(input('code=c&state=state-1'), {
        fetch: idp(userinfo),
        establishSession: neverSession,
      })
      expect(outcome.kind === 'failed' && outcome.reason).toBe('witus_claims')
    }
  })

  it('a failed session mint returns its own code', async () => {
    const outcome = await handleWitusCallback(input('code=c&state=state-1'), {
      fetch: idp({ sub: 'sub-1', email: 'person@example.com' }),
      establishSession: async () => 'witus_verify',
    })
    expect(outcome.redirectTo).toBe('/login?error=witus_verify&sso=tried')
  })
})
