import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/tickets/manifest?show_id=...
 *
 * Returns every ticket for the show with id + status so the scanner
 * can verify QRs while offline. Auth gated to tour staff (manager /
 * crew) — same gate as /api/tickets/scan.
 *
 * Response: { tickets: [{ id, status }], generated_at: ISO }
 */
function uuidLooksValid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const showId = url.searchParams.get('show_id')
  if (!showId || !uuidLooksValid(showId)) {
    return NextResponse.json({ error: 'show_id required' }, { status: 400 })
  }

  const admin = createAdminClient()
  // Authz: staff on the tour that owns this show.
  const { data: show } = await admin
    .from('shows')
    .select('tour_id')
    .eq('id', showId)
    .maybeSingle()
  if (!show) {
    return NextResponse.json({ error: 'show not found' }, { status: 404 })
  }
  const { count: staffCount } = await admin
    .from('tour_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('tour_id', show.tour_id)
    .in('role', ['manager', 'crew'])
  if (!staffCount) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { data: tickets } = await admin
    .from('tickets')
    .select('id, status')
    .eq('show_id', showId)
    .in('status', ['issued', 'used'])

  return NextResponse.json(
    {
      tickets: tickets || [],
      generated_at: new Date().toISOString(),
    },
    {
      headers: {
        // Manifest can be stale by a couple of seconds without hurting
        // — staff redownload it before doors anyway. No caching on
        // the response itself so an end-of-night change is fresh.
        'Cache-Control': 'private, no-store',
      },
    },
  )
}
