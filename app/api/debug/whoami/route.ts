import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Dev-only diagnostic: confirms (1) the cookie's JWT decodes server-side via getUser()
// and (2) PostgREST honors that JWT when issuing auth.uid() — by reading rows that
// only the authed user can see under RLS. If user is non-null but tour_member_count
// is 0 for a user who should have memberships, the JWT secret is mismatched and
// PostgREST is silently treating the request as anon.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'not available in production' }, { status: 404 })
  }

  const supabase = await createClient()

  const { data: userData, error: userErr } = await supabase.auth.getUser()
  const { data: sessionData } = await supabase.auth.getSession()

  let jwtIss: string | null = null
  const accessToken = sessionData.session?.access_token
  if (accessToken) {
    try {
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8')
      )
      jwtIss = payload.iss ?? null
    } catch {}
  }

  const { count: tourMemberCount, error: tmErr } = await supabase
    .from('tour_members')
    .select('*', { count: 'exact', head: true })

  const { data: insertData, error: insertErr } = await supabase
    .from('tours')
    .insert({
      name: '__diagnostic_probe__',
      artist_name: '__diagnostic_probe__',
      created_by: userData.user?.id,
    })
    .select('id')
    .single()

  if (insertData?.id) {
    await supabase.from('tours').delete().eq('id', insertData.id)
  }

  let diagnosis: string
  if (!userData.user) {
    diagnosis = 'no user — login first'
  } else if (insertErr) {
    diagnosis = `auth ok server-side, but tours INSERT failed: ${insertErr.message}`
  } else {
    diagnosis = 'auth ok end-to-end (insert + delete probe succeeded)'
  }

  return NextResponse.json({
    user: userData.user
      ? { id: userData.user.id, email: userData.user.email }
      : null,
    user_error: userErr?.message ?? null,
    jwt_iss: jwtIss,
    expected_iss_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL,
    tour_member_count: tourMemberCount,
    tour_member_error: tmErr?.message ?? null,
    insert_error: insertErr?.message ?? null,
    insert_error_code: (insertErr as { code?: string } | null)?.code ?? null,
    diagnosis,
  })
}
