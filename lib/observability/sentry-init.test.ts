import { afterEach, expect, it, vi } from 'vitest'

/**
 * Guards the property that makes this branch safe to merge before anyone provisions a DSN: with no
 * DSN in the environment the SDK is never initialised, so there is no transport, no network call,
 * and no behavior change for users. If someone later removes the `if (dsn)` guard, this fails.
 */

function mockSentry() {
  const init = vi.fn()
  vi.doMock('@sentry/nextjs', () => ({
    init,
    captureRouterTransitionStart: () => {},
    captureRequestError: () => {},
    withScope: () => {},
  }))
  return init
}

afterEach(() => {
  vi.resetModules()
  vi.doUnmock('@sentry/nextjs')
  delete process.env.SENTRY_DSN
  delete process.env.NEXT_PUBLIC_SENTRY_DSN
})

it('is inert on every runtime without a DSN', async () => {
  delete process.env.SENTRY_DSN
  delete process.env.NEXT_PUBLIC_SENTRY_DSN
  const init = mockSentry()

  await import('../../sentry.server.config')
  await import('../../sentry.edge.config')
  await import('../../instrumentation-client')

  expect(init).not.toHaveBeenCalled()
})

it('initialises with errors only once a DSN is set', async () => {
  vi.resetModules()
  process.env.SENTRY_DSN = 'https://examplekey@example.invalid/1'
  const init = mockSentry()

  await import('../../sentry.server.config')

  expect(init).toHaveBeenCalledOnce()
  const options = init.mock.calls[0]?.[0] as Record<string, unknown>
  // No tracing spend and no automatic PII attachment. The scrubber is the second line of defense,
  // not the first.
  expect(options.tracesSampleRate).toBe(0)
  expect(options.sendDefaultPii).toBe(false)
  expect(typeof options.beforeSend).toBe('function')
})
