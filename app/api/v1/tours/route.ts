import { createAdminClient } from '@/lib/supabase/admin'
import { validateApiKey, logApiRequest, jsonError, hasScope } from '@/lib/api/auth'

export async function GET(request: Request) {
  const start = Date.now()
  const apiKey = await validateApiKey(request)
  if (!apiKey) return jsonError('Invalid or missing API key', 401)
  if (!hasScope(apiKey.scopes, 'read')) return jsonError('Insufficient scope', 403)

  const supabase = createAdminClient()

  // Get tours for this org
  const { data: orgTours } = await supabase
    .from('tour_members')
    .select('tour_id')
    .in('user_id', (
      await supabase.from('org_members').select('user_id').eq('org_id', apiKey.org_id)
    ).data?.map((m) => m.user_id) || [])

  const tourIds = [...new Set((orgTours || []).map((t) => t.tour_id))]

  const { data: tours, error } = await supabase
    .from('tours')
    .select('id, name, artist_name, description, start_date, end_date, status, created_at')
    .in('id', tourIds.length > 0 ? tourIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })

  await logApiRequest(apiKey.id, 'GET', '/api/v1/tours', error ? 500 : 200, Date.now() - start)

  if (error) return jsonError(error.message, 500)

  return Response.json({ data: tours, count: tours.length })
}
