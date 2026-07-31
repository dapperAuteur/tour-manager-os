import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The contract this file defends: `/api/health` is a public, unauthenticated endpoint that must
// prove the database is reachable while giving an attacker nothing. So the assertions below are
// as much about what does NOT come back (raw errors, tour or advance data, row counts, elevated
// credentials) as about the happy-path status code.

const SUPABASE_URL = 'https://example-project.supabase.co'
const ANON_KEY = ['eyJhbGciOiJIUzI1NiJ9', 'eyJyb2xlIjoiYW5vbiJ9', 'anon-signature'].join('.')
const SERVICE_ROLE_KEY = ['eyJhbGciOiJIUzI1NiJ9', 'eyJyb2xlIjoic2VydmljZSJ9', 'svc-sig'].join('.')

interface QueryRecord {
  table: string
  columns: string
  options: { head?: boolean; count?: string } | undefined
  limit: number | undefined
  signal: AbortSignal | undefined
}

const createClientMock = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

/**
 * Minimal PostgREST builder double. `then` makes the builder awaitable exactly like the real one,
 * which is what lets the route `await` the chain.
 */
function stubSupabase(settle: (signal: AbortSignal | undefined) => Promise<unknown>) {
  const record: QueryRecord = {
    table: '',
    columns: '',
    options: undefined,
    limit: undefined,
    signal: undefined,
  }

  const builder = {
    select(columns: string, options?: { head?: boolean; count?: string }) {
      record.columns = columns
      record.options = options
      return builder
    },
    limit(n: number) {
      record.limit = n
      return builder
    },
    abortSignal(signal: AbortSignal) {
      record.signal = signal
      return builder
    },
    then(resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) {
      return settle(record.signal).then(resolve, reject)
    },
  }

  createClientMock.mockReturnValue({
    from(table: string) {
      record.table = table
      return builder
    },
  })

  return record
}

async function loadRoute() {
  vi.resetModules()
  return import('./route')
}

beforeEach(() => {
  createClientMock.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ANON_KEY
  process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE_ROLE_KEY
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('GET /api/health when the database answers', () => {
  it('returns 200 with the documented ok shape', async () => {
    stubSupabase(async () => ({ data: null, error: null }))
    const { GET } = await loadRoute()

    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, checks: { database: 'ok' } })
  })

  it('is never cached, so a monitor cannot be fooled by a stale 200', async () => {
    stubSupabase(async () => ({ data: null, error: null }))
    const { GET } = await loadRoute()

    const res = await GET()
    expect(res.headers.get('Cache-Control')).toContain('no-store')
  })

  it('really queries the database rather than answering from static JSON', async () => {
    const record = stubSupabase(async () => ({ data: null, error: null }))
    const { GET } = await loadRoute()

    await GET()
    expect(createClientMock).toHaveBeenCalledTimes(1)
    expect(record.table).not.toBe('')
    expect(record.limit).toBe(1)
  })
})

describe('the probe query itself', () => {
  it('uses the anon key and never the service role', async () => {
    stubSupabase(async () => ({ data: null, error: null }))
    const { GET } = await loadRoute()

    await GET()
    const [url, key] = createClientMock.mock.calls[0] as [string, string]
    expect(url).toBe(SUPABASE_URL)
    expect(key).toBe(ANON_KEY)
    expect(JSON.stringify(createClientMock.mock.calls)).not.toContain(SERVICE_ROLE_KEY)
  })

  it('reads a non-sensitive reference table, never tour, venue, ticket or advance data', async () => {
    const record = stubSupabase(async () => ({ data: null, error: null }))
    const { GET } = await loadRoute()

    await GET()
    expect(record.table).toBe('modules')
    for (const forbidden of ['tour', 'venue', 'show', 'ticket', 'advance', 'settlement']) {
      expect(record.table).not.toContain(forbidden)
    }
  })

  it('asks for no body and no count, so it cannot imply volume', async () => {
    const record = stubSupabase(async () => ({ data: null, error: null }))
    const { GET } = await loadRoute()

    await GET()
    expect(record.options?.head).toBe(true)
    expect(record.options?.count).toBeUndefined()
  })

  it('passes an abort signal that is live rather than already spent', async () => {
    const record = stubSupabase(async () => ({ data: null, error: null }))
    const { GET } = await loadRoute()

    await GET()
    expect(record.signal).toBeInstanceOf(AbortSignal)
    expect(record.signal?.aborted).toBe(false)
  })
})

describe('GET /api/health when the database is down', () => {
  it('returns 503 with the fixed literal for a PostgREST error', async () => {
    stubSupabase(async () => ({
      data: null,
      error: { code: '42P01', message: 'relation "modules" does not exist', details: 'schema' },
    }))
    const { GET } = await loadRoute()

    const res = await GET()
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ ok: false, error: 'database_unreachable' })
  })

  it('never echoes the raw error, which can carry the connection credentials', async () => {
    const secret = `postgres://admin:hunter2@db.internal:5432/postgres`
    stubSupabase(async () => {
      throw new Error(`connect ECONNREFUSED ${secret}`)
    })
    const { GET } = await loadRoute()

    const res = await GET()
    const body = await res.text()
    expect(res.status).toBe(503)
    expect(body).not.toContain(secret)
    expect(body).not.toContain('hunter2')
    expect(body).not.toContain('ECONNREFUSED')
    expect(body).toBe(JSON.stringify({ ok: false, error: 'database_unreachable' }))
  })

  it('logs at most an error code, never the error message', async () => {
    const logged: unknown[][] = []
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      logged.push(args)
    })
    stubSupabase(async () => ({
      data: null,
      error: { code: '08006', message: 'password authentication failed for user "hunter2"' },
    }))
    const { GET } = await loadRoute()

    await GET()
    const flat = JSON.stringify(logged)
    expect(flat).toContain('08006')
    expect(flat).not.toContain('hunter2')
    expect(flat).not.toContain('password authentication failed')
  })

  it('reports unreachable rather than a false green when Supabase env is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const { GET } = await loadRoute()

    const res = await GET()
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ ok: false, error: 'database_unreachable' })
    expect(createClientMock).not.toHaveBeenCalled()
  })

  it('fails the check on the 4 second timeout instead of hanging the monitor', async () => {
    vi.useFakeTimers()
    stubSupabase(
      (signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new Error('aborted')))
        }),
    )
    const { GET } = await loadRoute()

    const pending = GET()
    await vi.advanceTimersByTimeAsync(4000)
    const res = await pending

    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ ok: false, error: 'database_unreachable' })
  })
})

describe('HEAD /api/health', () => {
  it('runs the same check and returns no body', async () => {
    stubSupabase(async () => ({ data: null, error: null }))
    const { HEAD } = await loadRoute()

    const res = await HEAD()
    expect(res.status).toBe(200)
    expect(createClientMock).toHaveBeenCalledTimes(1)
    expect(await res.text()).toBe('')
  })

  it('returns 503 when the database is unreachable', async () => {
    stubSupabase(async () => ({ data: null, error: { code: '08006' } }))
    const { HEAD } = await loadRoute()

    const res = await HEAD()
    expect(res.status).toBe(503)
  })
})
