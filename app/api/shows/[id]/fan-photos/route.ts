import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteContext {
  params: Promise<{ id: string }>
}

const DEFAULT_LIMIT = 30
const MAX_LIMIT = 100

export async function GET(request: Request, context: RouteContext) {
  const { id: showId } = await context.params
  const url = new URL(request.url)
  const limitRaw = url.searchParams.get('limit')
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(limitRaw || '', 10) || DEFAULT_LIMIT),
  )

  // Public endpoint — only approved photos are returned. Use admin
  // client because anonymous reads don't go through the user-scoped
  // server client, and the RLS public-select policy already restricts
  // to status='approved'. Using admin here is explicit + uniform.
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('fan_photos')
    .select(
      'id, cloudinary_url, width, height, caption, submitted_at, user_id',
    )
    .eq('show_id', showId)
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ photos: data || [] })
}
