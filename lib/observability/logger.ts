import { getPostHogServer } from '@/lib/analytics/posthog-server'

export interface LogContext {
  [key: string]: unknown
}

function serializeError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  try {
    return new Error(JSON.stringify(error))
  } catch {
    return new Error('Unknown error')
  }
}

// Structured server-side error logger. Writes to console (Vercel
// runtime logs always capture stdout/stderr) AND forwards to PostHog
// as a $exception event when configured, so production failures are
// queryable beyond the rolling Vercel log window.
//
// Use for high-value handlers (webhooks, crons, payment paths) where
// you'd want to be alerted or want to query failure rates over time.
// For low-stakes debug output, keep using console.warn directly.
export function logError(
  message: string,
  error: unknown,
  context: LogContext = {},
): void {
  // 1. Vercel logs / local stdout.
  console.error(`[ERROR] ${message}`, error, context)

  // 2. PostHog $exception (fire-and-forget).
  try {
    const ph = getPostHogServer()
    if (!ph) return
    const err = serializeError(error)
    const properties: LogContext = { message, ...context }
    ph.captureException(err, undefined, properties)
  } catch {
    // observability must never throw into the caller's path
  }
}

// Structured info-level log for milestone events (cron started,
// webhook accepted, etc). Same dual-target as logError but the
// PostHog event is named explicitly rather than $exception.
export function logEvent(
  event: string,
  context: LogContext = {},
): void {
  console.log(`[INFO] ${event}`, context)
  try {
    const ph = getPostHogServer()
    if (!ph) return
    ph.capture({
      distinctId: 'server',
      event,
      properties: { ...context, $process_person_profile: false },
    })
  } catch {
    // swallow
  }
}
