import { createAdminClient } from '@/lib/supabase/admin'
import { requireApiKey, logApiRequest, jsonError } from '@/lib/api/auth'

export async function GET(request: Request) {
  const start = Date.now()
  const auth = await requireApiKey(request, 'read')
  if (auth instanceof Response) return auth
  const apiKey = auth

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
