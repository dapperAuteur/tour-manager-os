import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from '@/lib/observability/sentry-scrub'

// Edge-runtime error monitoring. This is the runtime middleware.ts executes on, which is the
// tenant resolver and the auth gate, so it is worth capturing. Same DSN guard as the server
// config: inert with no SENTRY_DSN.
const dsn = process.env.SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  })
}
