import { createClient } from '@supabase/supabase-js'

// Liveness probe for uptime monitoring (Better Stack). The homepage is NOT a valid monitor
// target: it can serve a cached 200 while Postgres is unreachable, so a green check there means
// nothing. This route proves the app can still reach the database on every single request.
//
// Threat model, because this is public and unauthenticated:
//   - It runs with the ANON key, never the service role. An elevated client on an open endpoint is
//     a standing invitation; the anon key here can read exactly what any logged-out browser can.
//   - It touches `modules`, the platform's feature registry, a tiny reference table with a
//     `using (true)` select policy (supabase/migrations/006_create_modules.sql). It holds no tour,
//     venue, show, ticket, settlement or advance-sheet data. Nothing about this app's customers.
//   - The query is `head: true` with no `count`, so PostgREST returns an empty body and we learn
//     "the database answered" without learning, returning, or implying a single row of volume.
//   - The failure branch returns a FIXED literal. A connection error message can carry the
//     connection string (and therefore credentials), and a PostgREST error can describe schema, so
//     no error text ever reaches the response body. At most an error CODE reaches the server log.
//
// It is also deliberately tenant-agnostic. It reads no host header, no cookie and no tenant
// context, and `modules` is global rather than org-scoped, so a request arriving on an unrecognised
// white-label domain gets the same answer as one on tour.witus.online. A healthy app must never
// read as down just because the caller used an unknown hostname. middleware.ts excludes
// `/api/health` from its matcher for the same reason: tenant resolution must not sit between the
// monitor and the answer.

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

/** Hard ceiling on the probe. A hung socket must fail the check, not hang the monitor. */
const TIMEOUT_MS = 4000

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
} as const

/**
 * Cheapest possible "is Postgres answering" question. Returns a boolean and nothing else, so no
 * detail from the failure path can leak into a caller's hands by accident.
 */
async function isDatabaseReachable(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // No credentials configured is not "healthy but idle", it is an app that cannot serve a single
  // page. Report it as unreachable rather than inventing a green check.
  if (!url || !anonKey) {
    console.error('[health] database check failed: supabase env not configured')
    return false
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const supabase = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })

    const { error } = await supabase
      .from('modules')
      .select('id', { head: true })
      .limit(1)
      .abortSignal(controller.signal)

    if (error) {
      // Code only. `error.message` and `error.details` can quote the query, the schema, or the
      // upstream connection string.
      console.error('[health] database check failed, code:', error.code ?? 'unknown')
      return false
    }

    return true
  } catch {
    // Bare catch, no binding: there is no way to accidentally format a thrown error that may hold
    // the DSN. Covers the abort timeout and any transport-level throw alike.
    console.error('[health] database check failed: request threw or timed out')
    return false
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(): Promise<Response> {
  const databaseOk = await isDatabaseReachable()

  if (!databaseOk) {
    return new Response(
      JSON.stringify({ ok: false, error: 'database_unreachable' }),
      { status: 503, headers: NO_STORE_HEADERS },
    )
  }

  return new Response(
    JSON.stringify({ ok: true, checks: { database: 'ok' } }),
    { status: 200, headers: NO_STORE_HEADERS },
  )
}

/**
 * Explicit HEAD so a monitor configured for HEAD gets a real check rather than a framework
 * default. Same status codes, no body.
 */
export async function HEAD(): Promise<Response> {
  const databaseOk = await isDatabaseReachable()
  return new Response(null, {
    status: databaseOk ? 200 : 503,
    headers: NO_STORE_HEADERS,
  })
}
