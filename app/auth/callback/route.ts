import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { LOGIN_NEXT_PARAM, signedInDestination } from '@/lib/auth/witus-sso'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Validated: `${origin}${redirect}` with redirect="@evil.example" is https://tour...@evil.example.
  const redirect = signedInDestination(searchParams.get(LOGIN_NEXT_PARAM))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
