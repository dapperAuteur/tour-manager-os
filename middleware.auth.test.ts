import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PUBLIC_PATH_PREFIXES,
  assertPrefixesAreSafe,
  isPublicPath,
  requiresAuth,
} from '@/lib/auth/public-paths'

// Regression suite for the auth gate that never fired. The public list contained '/' and was
// matched with `pathname.startsWith(path)`, so `isPublicPath` returned true for literally every
// request and the login redirect underneath it was dead code. Two layers of test here: the pure
// path rules, then the middleware end to end with Supabase and the tenant resolver mocked, because
// only the second one proves a real request actually gets a 307 to /login.

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  isPlatformHost: vi.fn(),
  resolveTenantFromHost: vi.fn(),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: mocks.getUser } }),
}))

vi.mock('@/lib/multi-tenant/resolver', () => ({
  isPlatformHost: mocks.isPlatformHost,
  resolveTenantFromHost: mocks.resolveTenantFromHost,
}))

describe('public path rules', () => {
  it('treats "/" as the root only, never as a prefix of everything', () => {
    expect(isPublicPath('/')).toBe(true)
    expect(isPublicPath('/today')).toBe(false)
    expect(isPublicPath('/dashboard')).toBe(false)
  })

  it('no public prefix can ever match every path again', () => {
    expect(() => assertPrefixesAreSafe()).not.toThrow()
    for (const prefix of PUBLIC_PATH_PREFIXES) {
      expect(prefix).not.toBe('/')
      expect(prefix.length).toBeGreaterThan(1)
      expect(isPublicPath('/some-protected-page')).toBe(false)
    }
  })

  it('requires auth for the private surfaces the middleware is supposed to guard', () => {
    const protectedPaths = [
      '/today',
      '/dashboard',
      '/tours',
      '/tours/abc-123',
      '/tours/abc-123/finances',
      '/tours/abc-123/finances/splits',
      '/tours/abc-123/shows/def-456',
      '/tours/abc-123/shows/def-456/rider',
      '/venues',
      '/venues/abc-123',
      '/venues/map',
      '/production/stage-plots',
      '/settings',
      '/settings/rider-template',
      '/merch/orders',
      '/me/finances',
      '/admin/dashboard',
      '/admin/users',
      '/admin/api-keys',
      '/onboarding',
      '/contacts',
      '/packages/abc-123',
      '/wellness/burnout',
      '/academy',
      '/hub',
      '/community',
      '/data/import',
      '/blog/new',
      '/feedback',
      '/help',
      '/developers',
      '/marketing',
      '/modules',
      '/photos', // the authed gallery; /photos/<id> is the public share page
    ]
    for (const path of protectedPaths) {
      expect(requiresAuth(path), `${path} should require auth`).toBe(true)
    }
  })

  it('leaves the genuinely public surfaces open', () => {
    const publicPaths = [
      '/',
      '/login',
      '/signup',
      '/pricing',
      '/roadmap',
      '/features',
      '/features/academy',
      '/wellness-resources',
      '/for/musicians',
      '/for/venues',
      '/auth/callback',
      '/advance/6f1c8a2e-token',
      '/shows/abc-123',
      '/shows/abc-123/tickets',
      '/store/bandname',
      '/photos/abc-123',
      '/tickets/abc-123',
      '/tickets/success',
      // Crawlers and the push service worker are anonymous by nature.
      '/robots.txt',
      '/sitemap.xml',
      '/sw.js',
    ]
    for (const path of publicPaths) {
      expect(requiresAuth(path), `${path} should stay public`).toBe(false)
    }
  })

  it('never bounces a route handler to the HTML login page', () => {
    // /api/health is the uptime probe and must answer on every host. The rest either enforce
    // their own gate (session + 401, API key, HMAC, CRON_SECRET) or are anonymous by design.
    const apiPaths = [
      '/api/health',
      '/api/stripe/webhook',
      '/api/webhooks/mailgun',
      '/api/cron/reset-demo',
      '/api/v1/tours',
      '/api/tickets/abc-123/pkpass',
      '/api/merch/checkout',
      '/api/tours/abc-123/settlement-pdf',
    ]
    for (const path of apiPaths) {
      expect(requiresAuth(path), `${path} should not redirect`).toBe(false)
    }
  })

  it('does not let a prefix swallow an adjacent route', () => {
    // '/advance/' with the trailing slash, so a hypothetical '/advanced-settings' stays gated.
    expect(requiresAuth('/advanced-settings')).toBe(true)
    expect(requiresAuth('/for-hire')).toBe(true)
    expect(requiresAuth('/showsettings')).toBe(true)
    expect(requiresAuth('/storefront-admin')).toBe(true)
    expect(requiresAuth('/loginhistory')).toBe(true)
  })
})

describe('middleware auth gate', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    mocks.isPlatformHost.mockReturnValue(true)
    mocks.resolveTenantFromHost.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  async function run(url: string, host = 'tour.witus.online') {
    const { NextRequest } = await import('next/server')
    const { middleware } = await import('./middleware')
    return middleware(new NextRequest(url, { headers: { host } }))
  }

  it('redirects a signed-out visitor off a protected page and remembers where they were going', async () => {
    const response = await run('https://tour.witus.online/tours/abc-123/finances')
    expect(response.status).toBe(307)
    const location = new URL(response.headers.get('location') as string)
    expect(location.pathname).toBe('/login')
    expect(location.searchParams.get('redirect')).toBe('/tours/abc-123/finances')
  })

  it('lets a signed-in user through the same page', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const response = await run('https://tour.witus.online/tours/abc-123/finances')
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('does not redirect the bearer-token advance sheet', async () => {
    const response = await run('https://tour.witus.online/advance/6f1c8a2e-token')
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('does not redirect the health probe', async () => {
    const response = await run('https://tour.witus.online/api/health')
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('serves the marketing root to anonymous visitors', async () => {
    const response = await run('https://tour.witus.online/')
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('still rewrites the root on a verified custom domain', async () => {
    mocks.isPlatformHost.mockReturnValue(false)
    mocks.resolveTenantFromHost.mockResolvedValue({
      domain: 'merch.bandname.com',
      org_id: 'org-1',
      org_slug: 'bandname',
      org_name: 'Band Name',
      brand_primary_color: null,
      white_label_enabled: true,
      landing_path: '/store/bandname',
    })
    const response = await run('https://merch.bandname.com/', 'merch.bandname.com')
    expect(response.headers.get('x-tmos-tenant-org')).toBe('bandname')
    expect(response.headers.get('location')).toBeNull()
  })

  it('passes an unconfigured Supabase environment straight through', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const response = await run('https://tour.witus.online/today')
    expect(response.headers.get('location')).toBeNull()
  })
})
