import { describe, expect, it, vi } from 'vitest'
import {
  SIGN_OUT_EVERYWHERE_HELP,
  SIGN_OUT_EVERYWHERE_LABEL,
  SIGN_OUT_LABEL,
  SILENT_SSO_COOKIE,
  buildWitusAuthorizeUrl,
  endSessionEndpointFromAuthorizeUrl,
  hasSilentSsoFlag,
  quietLoginPath,
  safeNextPath,
  signOutEverywhere,
  silentSsoDecision,
  silentSsoFlagCookie,
  witusAuthorizePath,
  witusErrorMessage,
  witusLogoutUrl,
  witusRedirectUri,
  witusSsoConfigFor,
} from './witus-sso'

// "Sign in with WitUS" helpers (lib/auth/witus-sso.ts): the server-side gate, the authorize URL
// and PKCE parameters, the silent-attempt loop guard, the redirect allowlist, and the sign-out URL
// builder and order. Ported from CentenarianOS tests/unit/witus-silent-sso.test.ts plus the
// sign-out cases from contractor-os tests/witus-sso.test.ts. Every value below is made up.

const AUTHORIZE = 'https://idp.example/api/idp/oauth2/authorize'

describe('the server-side gate', () => {
  const base = {
    clientId: 'witus-tour',
    authorizeUrl: AUTHORIZE,
    siteUrl: 'https://tour.example',
    requestHost: 'tour.example',
  }

  it('is on for a configured client on the registered host', () => {
    const config = witusSsoConfigFor(base)
    expect(config.enabled).toBe(true)
    expect(config.signOutEverywhereUrl).not.toBeNull()
  })

  it('is fully off with no client id', () => {
    expect(witusSsoConfigFor({ ...base, clientId: '' })).toEqual({
      enabled: false,
      signOutEverywhereUrl: null,
    })
    expect(witusSsoConfigFor({ ...base, clientId: undefined }).enabled).toBe(false)
  })

  it('is off on a white-label custom domain, a preview, or localhost', () => {
    for (const requestHost of ['tickets.someband.com', 'tour-abc123.vercel.app', 'localhost:3000']) {
      expect(witusSsoConfigFor({ ...base, requestHost })).toEqual({
        enabled: false,
        signOutEverywhereUrl: null,
      })
    }
  })

  it('is off when the host is unknown or the site URL is not usable', () => {
    expect(witusSsoConfigFor({ ...base, requestHost: null }).enabled).toBe(false)
    expect(witusSsoConfigFor({ ...base, siteUrl: 'not a url' }).enabled).toBe(false)
    expect(witusSsoConfigFor({ ...base, siteUrl: 'ftp://tour.example' }).enabled).toBe(false)
  })

  it('compares hosts case-insensitively and ignores a trailing slash on the site URL', () => {
    expect(
      witusSsoConfigFor({ ...base, siteUrl: 'https://tour.example/', requestHost: 'Tour.Example' })
        .enabled,
    ).toBe(true)
  })
})

describe('the sign-out URL builder', () => {
  it('derives the endsession endpoint from the authorize URL', () => {
    expect(endSessionEndpointFromAuthorizeUrl(AUTHORIZE)).toBe(
      'https://idp.example/api/idp/oauth2/endsession',
    )
    expect(endSessionEndpointFromAuthorizeUrl('https://idp.example/other')).toBeNull()
    expect(endSessionEndpointFromAuthorizeUrl('nope')).toBeNull()
    expect(endSessionEndpointFromAuthorizeUrl(undefined)).toBeNull()
  })

  it('carries client_id and the site root WITH its trailing slash', () => {
    const url = new URL(
      witusLogoutUrl('https://idp.example/api/idp/oauth2/endsession', 'witus-tour', 'https://tour.example'),
    )
    expect(url.origin + url.pathname).toBe('https://idp.example/api/idp/oauth2/endsession')
    expect(url.searchParams.get('client_id')).toBe('witus-tour')
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe('https://tour.example/')
  })

  it('never doubles the slash', () => {
    const url = new URL(witusLogoutUrl('https://idp.example/x/oauth2/endsession', 'c', 'https://tour.example/'))
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe('https://tour.example/')
  })

  it('is what the gate hands the sidebar', () => {
    const config = witusSsoConfigFor({
      clientId: 'witus-tour',
      authorizeUrl: AUTHORIZE,
      siteUrl: 'https://tour.example',
      requestHost: 'tour.example',
    })
    expect(config.signOutEverywhereUrl).toBe(
      'https://idp.example/api/idp/oauth2/endsession?client_id=witus-tour&post_logout_redirect_uri=https%3A%2F%2Ftour.example%2F',
    )
  })

  it('is null (control hidden) when the authorize URL has no recognizable endpoint path', () => {
    const config = witusSsoConfigFor({
      clientId: 'witus-tour',
      authorizeUrl: 'https://idp.example/authorize',
      siteUrl: 'https://tour.example',
      requestHost: 'tour.example',
    })
    expect(config).toEqual({ enabled: true, signOutEverywhereUrl: null })
  })
})

describe('sign out everywhere', () => {
  it('ends the local session BEFORE it navigates to the IdP', async () => {
    const steps: string[] = []
    await signOutEverywhere({
      signOutLocal: async () => {
        steps.push('local')
      },
      navigate: (url) => steps.push(`navigate ${url}`),
      logoutUrl: 'https://idp.example/endsession?client_id=c',
    })
    expect(steps).toEqual(['local', 'navigate https://idp.example/endsession?client_id=c'])
  })

  it('still navigates when the local sign-out throws', async () => {
    const navigate = vi.fn()
    await signOutEverywhere({
      signOutLocal: async () => {
        throw new Error('network down')
      },
      navigate,
      logoutUrl: 'https://idp.example/endsession',
    })
    expect(navigate).toHaveBeenCalledWith('https://idp.example/endsession')
  })

  it('uses the exact ecosystem copy', () => {
    expect(SIGN_OUT_LABEL).toBe('Sign out')
    expect(SIGN_OUT_EVERYWHERE_LABEL).toBe('Sign out of WitUS everywhere')
    expect(SIGN_OUT_EVERYWHERE_HELP).toBe(
      'Also signs you out of WitUS. Other WitUS apps you are signed in to stay signed in until you sign out of them.',
    )
  })
})

describe('the authorize request (PKCE + state)', () => {
  const base = {
    authorizeUrl: AUTHORIZE,
    clientId: 'client-x',
    redirectUri: 'https://tour.example/api/auth/witus/callback',
    state: 'state-1',
    codeChallenge: 'challenge-1',
  }

  it('sends code flow, S256 PKCE, the state and the exact redirect URI', () => {
    const url = new URL(buildWitusAuthorizeUrl(base))
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('client_id')).toBe('client-x')
    expect(url.searchParams.get('redirect_uri')).toBe(base.redirectUri)
    expect(url.searchParams.get('scope')).toBe('openid email profile')
    expect(url.searchParams.get('state')).toBe('state-1')
    expect(url.searchParams.get('code_challenge')).toBe('challenge-1')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('prompt')).toBeNull()
  })

  it('the silent URL is the interactive one plus prompt=none', () => {
    const interactive = new URL(buildWitusAuthorizeUrl(base))
    const silent = new URL(buildWitusAuthorizeUrl({ ...base, silent: true }))
    expect(silent.searchParams.get('prompt')).toBe('none')
    silent.searchParams.delete('prompt')
    expect(silent.toString()).toBe(interactive.toString())
  })

  it('the callback path is the one the IdP must register', () => {
    expect(witusRedirectUri('https://tour.example')).toBe('https://tour.example/api/auth/witus/callback')
    expect(witusRedirectUri('https://tour.example/')).toBe('https://tour.example/api/auth/witus/callback')
  })

  it('the login page links to the same-origin route, carrying a safe path only', () => {
    expect(witusAuthorizePath(null)).toBe('/api/auth/witus/authorize')
    expect(witusAuthorizePath(null, true)).toBe('/api/auth/witus/authorize?prompt=none')
    expect(witusAuthorizePath('/tours/1?tab=shows', true)).toBe(
      '/api/auth/witus/authorize?prompt=none&from=%2Ftours%2F1%3Ftab%3Dshows',
    )
    expect(witusAuthorizePath('https://evil.example')).toBe('/api/auth/witus/authorize')
  })
})

describe('the silent attempt and its loop guard', () => {
  it('a signed-out first visit attempts silent sign-in', () => {
    expect(silentSsoDecision({ enabled: true, search: '', attempted: false })).toEqual({ attempt: true })
  })

  it('the browser-session flag prevents a second attempt', () => {
    const cookie = `theme=light; ${silentSsoFlagCookie(true).split(';')[0]}; other=x`
    expect(hasSilentSsoFlag(cookie)).toBe(true)
    expect(silentSsoDecision({ enabled: true, search: '', attempted: hasSilentSsoFlag(cookie) })).toEqual({
      attempt: false,
      skip: 'already-attempted',
    })
  })

  it('the flag lasts for the browser session only and is site-wide', () => {
    const cookie = silentSsoFlagCookie(true)
    expect(cookie).toMatch(new RegExp(`^${SILENT_SSO_COOKIE}=1;`))
    expect(cookie).toMatch(/Path=\//)
    expect(cookie).toMatch(/SameSite=Lax/)
    expect(cookie).toMatch(/Secure/)
    expect(cookie).not.toMatch(/Max-Age|Expires/i)
    expect(silentSsoFlagCookie(false)).not.toMatch(/Secure/)
  })

  it('a lookalike cookie does not count as the flag', () => {
    expect(hasSilentSsoFlag(`x${SILENT_SSO_COOKIE}=1`)).toBe(false)
    expect(hasSilentSsoFlag(`${SILENT_SSO_COOKIE}=0`)).toBe(false)
    expect(hasSilentSsoFlag('')).toBe(false)
    expect(hasSilentSsoFlag(undefined)).toBe(false)
  })

  it('the ?sso=tried marker stops a retry even without the cookie', () => {
    expect(silentSsoDecision({ enabled: true, search: '?sso=tried' })).toEqual({
      attempt: false,
      skip: 'already-attempted',
    })
  })

  it("the quiet return keeps Tour's ?redirect= and carries the marker, so it cannot loop", () => {
    expect(quietLoginPath(null)).toBe('/login?sso=tried')
    const back = quietLoginPath('/tours/1')
    expect(back).toBe('/login?redirect=%2Ftours%2F1&sso=tried')
    expect(silentSsoDecision({ enabled: true, search: back.split('?')[1] })).toEqual({
      attempt: false,
      skip: 'already-attempted',
    })
  })

  it('a page showing an error never starts an attempt', () => {
    expect(silentSsoDecision({ enabled: true, search: '?error=witus_token' })).toEqual({
      attempt: false,
      skip: 'error-shown',
    })
  })

  it('no attempt when not configured, when signed in, or with ?no_sso=1', () => {
    expect(silentSsoDecision({ enabled: false, search: '' })).toEqual({ attempt: false, skip: 'not-configured' })
    expect(silentSsoDecision({ enabled: true, signedIn: true })).toEqual({
      attempt: false,
      skip: 'already-signed-in',
    })
    expect(silentSsoDecision({ enabled: true, search: 'redirect=%2Fdashboard&no_sso=1' })).toEqual({
      attempt: false,
      skip: 'escape-hatch',
    })
    expect(silentSsoDecision({ enabled: true, search: '?no_sso=0' })).toEqual({ attempt: true })
  })
})

describe('safeNextPath', () => {
  it('refuses anything that could leave the site', () => {
    for (const bad of ['//evil.example', '/\\evil.example', 'https://evil.example', 'dashboard', '', '/a\nb', `/${'a'.repeat(600)}`]) {
      expect(safeNextPath(bad)).toBeNull()
    }
    expect(safeNextPath(null)).toBeNull()
  })

  it('keeps an ordinary in-app path', () => {
    expect(safeNextPath('/tours/1/shows/2?tab=advance')).toBe('/tours/1/shows/2?tab=advance')
  })
})

describe('login page error copy', () => {
  it('maps every witus_* code and nothing else', () => {
    for (const code of ['witus_not_configured', 'witus_state', 'witus_token', 'witus_userinfo', 'witus_claims', 'witus_session', 'witus_verify']) {
      expect(witusErrorMessage(code)).toEqual(expect.any(String))
    }
    expect(witusErrorMessage('auth_failed')).toBeNull()
    expect(witusErrorMessage('<script>')).toBeNull()
    expect(witusErrorMessage(undefined)).toBeNull()
  })
})
