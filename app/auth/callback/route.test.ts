import { beforeEach, describe, expect, it, vi } from 'vitest'

// The email-link callback builds `${origin}${redirect}`. Before validation, `?redirect=@evil.example`
// produced https://tour.witus.online@evil.example, which a browser reads as host evil.example.

const exchangeCodeForSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}))

import { GET } from './route'

const ORIGIN = 'https://tour.witus.online'

function callback(redirect?: string): Request {
  const url = new URL('/auth/callback', ORIGIN)
  url.searchParams.set('code', 'abc')
  if (redirect !== undefined) url.searchParams.set('redirect', redirect)
  return new Request(url)
}

describe('GET /auth/callback', () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset()
    exchangeCodeForSession.mockResolvedValue({ error: null })
  })

  it('lands on a carried same-origin path', async () => {
    const res = await GET(callback('/tours/new'))
    expect(res.headers.get('location')).toBe(`${ORIGIN}/tours/new`)
  })

  it.each(['@evil.example', '.evil.example', 'https://evil.example', '//evil.example', '/\\evil.example'])(
    'stays on tour for redirect=%j',
    async (redirect) => {
      const res = await GET(callback(redirect))
      const location = new URL(res.headers.get('location')!)
      expect(location.origin).toBe(ORIGIN)
      expect(location.pathname).toBe('/dashboard')
    },
  )

  it('defaults to the dashboard with no redirect', async () => {
    const res = await GET(callback())
    expect(res.headers.get('location')).toBe(`${ORIGIN}/dashboard`)
  })
})
