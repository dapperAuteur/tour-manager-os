import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pushToUser } from '@/lib/push/server'

/**
 * POST — sends a single test push to every device the signed-in user
 * has registered. Used by the settings page so users can confirm
 * their browser is wired up before they trust real schedule alerts.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const result = await pushToUser(user.id, {
    title: 'Tour Manager OS',
    body: 'Test notification — your device is connected.',
    url: '/settings',
    topic: 'test',
  })
  return NextResponse.json(result)
}
