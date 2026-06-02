import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Body {
  endpoint: string
  keys: { p256dh: string; auth: string }
  user_agent?: string
  topics?: string[]
}

/**
 * POST: register or refresh a web-push device subscription for the
 * signed-in user. Idempotent: (user_id, endpoint) is unique, so the
 * same browser can re-subscribe without piling up rows.
 */
export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ error: 'endpoint + keys required' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const topics =
    Array.isArray(body.topics) && body.topics.length > 0
      ? body.topics.filter((t) => typeof t === 'string').slice(0, 16)
      : ['schedule_change', 'advance_submitted', 'poll_closing']

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        user_agent: body.user_agent ?? null,
        topics,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,endpoint' },
    )
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

/**
 * DELETE ?endpoint=...  — remove this browser's subscription so it
 * stops receiving pushes. Used by the opt-out toggle.
 */
export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const endpoint = url.searchParams.get('endpoint')
  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint required' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
