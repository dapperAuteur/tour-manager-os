import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseWanderlearnInput } from '@/lib/shows/wanderlearn'

/**
 * POST /api/shows/[id]/wanderlearn
 * Body: { input: string }  — a pasted WanderLearn iframe or URL; empty clears it.
 *
 * Saves the allowlisted embed URL on the show. Tour-member auth required.
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
    | { input?: string }
    | null
  const rawInput = (body?.input ?? '').trim()

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

  // Empty input clears the tour.
  let urlToStore: string | null = null
  if (rawInput) {
    const { url, error } = parseWanderlearnInput(rawInput)
    if (error || !url) {
      return NextResponse.json(
        { error: error || 'Could not read that link.' },
        { status: 400 },
      )
    }
    urlToStore = url
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('shows')
    .update({ wanderlearn_url: urlToStore })
    .eq('id', showId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, wanderlearn_url: urlToStore })
}
