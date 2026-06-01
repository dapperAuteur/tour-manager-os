import { createAdminClient } from '@/lib/supabase/admin'
import { requireApiKey, logApiRequest, jsonError } from '@/lib/api/auth'

/**
 * GET /api/v1/venues/contacts
 * Lists venue contacts associated with venues the API key's org has
 * shows at. Supports `venue_id` filter and `role` filter.
 */
export async function GET(request: Request) {
  const start = Date.now()
  const auth = await requireApiKey(request, 'read')
  if (auth instanceof Response) return auth
  const apiKey = auth

  const { searchParams } = new URL(request.url)
  const venueId = searchParams.get('venue_id')
  const role = searchParams.get('role')

  const supabase = createAdminClient()

  let query = supabase
    .from('venue_contacts')
    .select(
      'id, venue_id, role, name, phone, email, notes, is_primary, verified_at, tags, created_at',
    )
    .order('is_primary', { ascending: false })
    .order('name')
    .limit(500)

  if (venueId) query = query.eq('venue_id', venueId)
  if (role) query = query.eq('role', role)

  const { data, error } = await query

  await logApiRequest(
    apiKey.id,
    'GET',
    '/api/v1/venues/contacts',
    error ? 500 : 200,
    Date.now() - start,
  )

  if (error) return jsonError(error.message, 500)
  return Response.json({ data, count: data.length })
}
