import { describe, expect, it } from 'vitest'
import { config } from './middleware'

// The uptime probe has to be tenant-agnostic. Middleware is where host-dependent behaviour lives
// (custom-domain tenant lookup, then the cookie auth gate), so the guarantee is only real while
// `/api/health` stays outside the matcher. This test is the tripwire for someone rewriting that
// pattern later and silently putting a Supabase domain lookup in front of the monitor.

function matches(pathname: string): boolean {
  return config.matcher.some((pattern) => new RegExp(`^${pattern}$`).test(pathname))
}

describe('middleware matcher', () => {
  it('does not run for the health endpoint', () => {
    expect(matches('/api/health')).toBe(false)
  })

  it('still runs for ordinary app routes', () => {
    expect(matches('/today')).toBe(true)
    expect(matches('/api/tours')).toBe(true)
  })

  it('exempts only the exact path, not everything that starts with it', () => {
    expect(matches('/api/healthcheck')).toBe(true)
    expect(matches('/api/health/detail')).toBe(true)
  })
})
