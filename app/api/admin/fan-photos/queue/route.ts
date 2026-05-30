import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const showId = url.searchParams.get('show_id')
  const status = url.searchParams.get('status') || 'pending'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Uses the user-scoped client so RLS staff-select policy gates
  // visibility to manager/crew of the show's tour.
  let query = supabase
    .from('fan_photos')
    .select(
      `id, show_id, user_id, cloudinary_url, width, height, caption,
       status, submitted_at, moderated_at, rejection_reason`,
    )
    .order('submitted_at', { ascending: true })
    .limit(100)

  if (showId) query = query.eq('show_id', showId)
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ photos: data || [] })
}
