import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/oauth/gmail/disconnect
 *
 * Forget the Gmail connection for the signed-in user. We do NOT call
 * Google&rsquo;s revoke endpoint here — the user can revoke at
 * https://myaccount.google.com/permissions if they want the
 * authorization wiped from Google&rsquo;s side too.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { error } = await supabase
    .from('oauth_email_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', 'gmail')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
