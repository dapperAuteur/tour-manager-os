import { createAdminClient } from '@/lib/supabase/admin'
import { validateApiKey, logApiRequest, jsonError, hasScope } from '@/lib/api/auth'

export async function GET(request: Request) {
  const start = Date.now()
  const apiKey = await validateApiKey(request)
  if (!apiKey) return jsonError('Invalid or missing API key', 401)
  if (!hasScope(apiKey.scopes, 'read')) return jsonError('Insufficient scope', 403)

  const { searchParams } = new URL(request.url)
  const tourId = searchParams.get('tour_id')

  if (!tourId) return jsonError('tour_id query parameter is required', 400)

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('itinerary_days')
    .select('*, schedule_items(*), flights(*)')
    .eq('tour_id', tourId)
    .order('date', { ascending: true })

  await logApiRequest(apiKey.id, 'GET', '/api/v1/itineraries', error ? 500 : 200, Date.now() - start)

  if (error) return jsonError(error.message, 500)

  return Response.json({ data, count: data.length })
}
