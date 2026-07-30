import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from '@/lib/observability/sentry-scrub'

// Node-runtime error monitoring. Loaded by instrumentation.ts register() when NEXT_RUNTIME is
// "nodejs". The DSN points at Better Stack, which ingests the Sentry SDK's payloads (swapping
// vendors later is one env var, no code change).
//
// GUARDED ON THE DSN: with no SENTRY_DSN set, init() is skipped entirely and the SDK is inert, so
// the app ships and runs exactly as before until BAM provisions the project and sets the var
// (see plans/user-tasks/).
const dsn = process.env.SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // Errors only. No performance tracing until we decide we want the volume.
    tracesSampleRate: 0,
    // Never auto-attach IP / cookies / user email. The beforeSend scrub is the second line of
    // defense, not the first.
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  })
}
