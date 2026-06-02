import { NextResponse } from 'next/server'
import {
  emailIsSubscribed,
  listUnlockedForShow,
} from '@/lib/exclusive-content/queries'

/**
 * POST { email } → unlocked exclusive pieces for this show if the
 * email is on any of the org's subscriber lists AND the per-piece
 * time window is open. Anonymous — no auth required, but we don't
 * leak content unless the email actually matches a subscriber.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: showId } = await params
  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const email = (body.email || '').trim()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const subscribed = await emailIsSubscribed(showId, email)
  if (!subscribed) {
    return NextResponse.json(
      {
        unlocked: false,
        hint:
          "We don't see that email on the band's list. Try the one you signed up with — or check back after you join the list.",
      },
      { status: 200 },
    )
  }

  const pieces = await listUnlockedForShow(showId)
  return NextResponse.json({
    unlocked: true,
    pieces: pieces.map((p) => ({
      id: p.id,
      phase: p.phase,
      title: p.title,
      body: p.body,
      media_url: p.media_url,
      call_to_action_label: p.call_to_action_label,
      call_to_action_url: p.call_to_action_url,
    })),
  })
}
