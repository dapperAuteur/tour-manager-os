import { createAdminClient } from '@/lib/supabase/admin'
import { validateApiKey, logApiRequest, jsonError, hasScope } from '@/lib/api/auth'

export async function GET(request: Request) {
  const start = Date.now()
  const apiKey = await validateApiKey(request)
  if (!apiKey) return jsonError('Invalid or missing API key', 401)
  if (!hasScope(apiKey.scopes, 'read')) return jsonError('Insufficient scope', 403)

  const { searchParams } = new URL(request.url)
  const tourId = searchParams.get('tour_id')

  const supabase = createAdminClient()

  let query = supabase
    .from('shows')
    .select('id, tour_id, date, city, state, country, venue_name, status, timezone, created_at')
    .order('date', { ascending: true })

  if (tourId) {
    query = query.eq('tour_id', tourId)
  }

  const { data: shows, error } = await query

  await logApiRequest(apiKey.id, 'GET', '/api/v1/shows', error ? 500 : 200, Date.now() - start)

  if (error) return jsonError(error.message, 500)

  return Response.json({ data: shows, count: shows.length })
}
