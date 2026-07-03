import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/shows/[id]/stream
 * Body: { action: 'start' | 'stop' }
 *
 * Toggles the shows.stream_live flag. Tour-member auth required
 * (managers own this in practice; anyone on the tour can flip it).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: showId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | { action?: 'start' | 'stop' }
    | null
  const action = body?.action
  if (action !== 'start' && action !== 'stop') {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 })
  }

  const { data: show } = await supabase
    .from('shows')
    .select('id, tour_id')
    .eq('id', showId)
    .maybeSingle()
  if (!show) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  // Tour-member gate.
  const { count } = await supabase
    .from('tour_members')
    .select('*', { count: 'exact', head: true })
    .eq('tour_id', show.tour_id)
    .eq('user_id', user.id)
  if (!count) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const patch =
    action === 'start'
      ? { stream_live: true, stream_started_at: new Date().toISOString() }
      : { stream_live: false, stream_started_at: null }
  const { error } = await admin.from('shows').update(patch).eq('id', showId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, stream_live: patch.stream_live })
}
