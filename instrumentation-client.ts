import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from '@/lib/observability/sentry-scrub'

// Browser-runtime error monitoring. Reads the PUBLIC DSN, which Next inlines at build time.
// Guarded: with no NEXT_PUBLIC_SENTRY_DSN the SDK never initializes, so nothing is sent, no extra
// network request is made, and nothing changes for users.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    // Errors only. Session replay stays off: PostHog already owns replay in this app and running
    // two recorders doubles the payload for no extra signal.
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  })
}

// Instruments App Router client navigations. No-op when init above was skipped.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
