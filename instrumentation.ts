import * as Sentry from '@sentry/nextjs'
import type { Instrumentation } from 'next'

// Next.js instrumentation hook. Loads the right error-monitoring config per runtime. Everything
// stays inert without SENTRY_DSN (the guard lives in the two config files).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') await import('./sentry.server.config')
  if (process.env.NEXT_RUNTIME === 'edge') await import('./sentry.edge.config')
}

// Captures errors thrown while rendering or serving a request. We tag the request HOST because
// this app is multi-tenant by custom domain (middleware.ts -> lib/multi-tenant/resolver), so the
// host attributes a crash to the right white-label brand WITHOUT a database lookup in the error
// path and without carrying any user PII. captureRequestError does the rest.
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const raw = request.headers as unknown
  let host: string | undefined
  if (raw instanceof Headers) {
    host = raw.get('host') ?? raw.get('x-forwarded-host') ?? undefined
  } else if (raw && typeof raw === 'object') {
    const headers = raw as Record<string, unknown>
    const value = headers.host ?? headers['x-forwarded-host']
    if (typeof value === 'string') host = value
  }

  Sentry.withScope((scope) => {
    if (host) scope.setTag('tenant.host', host)
    Sentry.captureRequestError(err, request, context)
  })
}
