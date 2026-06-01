import { createAdminClient } from '@/lib/supabase/admin'
import { requireApiKey, logApiRequest, jsonError } from '@/lib/api/auth'

/**
 * GET /api/v1/finances/expenses
 * Lists expenses for tours that belong to the API key's org. Supports
 * `tour_id` filter and `limit` / `offset` pagination.
 */
export async function GET(request: Request) {
  const start = Date.now()
  const auth = await requireApiKey(request, 'read')
  if (auth instanceof Response) return auth
  const apiKey = auth

  const { searchParams } = new URL(request.url)
  const tourId = searchParams.get('tour_id')
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 100), 1), 500)
  const offset = Math.max(Number(searchParams.get('offset') || 0), 0)
  const status = searchParams.get('status')

  const supabase = createAdminClient()

  // Tours visible to the org: same lookup the tours route uses.
  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('user_id')
    .eq('org_id', apiKey.org_id)
  const memberIds = (orgMembers || []).map((m) => m.user_id)
  if (memberIds.length === 0) {
    await logApiRequest(apiKey.id, 'GET', '/api/v1/finances/expenses', 200, Date.now() - start)
    return Response.json({ data: [], count: 0, limit, offset })
  }

  const { data: orgTours } = await supabase
    .from('tour_members')
    .select('tour_id')
    .in('user_id', memberIds)
  const tourIds = [...new Set((orgTours || []).map((t) => t.tour_id))]
  if (tourIds.length === 0) {
    await logApiRequest(apiKey.id, 'GET', '/api/v1/finances/expenses', 200, Date.now() - start)
    return Response.json({ data: [], count: 0, limit, offset })
  }

  let query = supabase
    .from('expenses')
    .select('id, tour_id, show_id, member_id, date, category, amount, description, is_tax_deductible, status, created_at')
    .in('tour_id', tourIds)
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tourId) {
    if (!tourIds.includes(tourId)) {
      await logApiRequest(apiKey.id, 'GET', '/api/v1/finances/expenses', 404, Date.now() - start)
      return jsonError('tour_id not accessible by this API key', 404)
    }
    query = query.eq('tour_id', tourId)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data: expenses, error } = await query

  await logApiRequest(
    apiKey.id,
    'GET',
    '/api/v1/finances/expenses',
    error ? 500 : 200,
    Date.now() - start,
  )

  if (error) return jsonError(error.message, 500)
  return Response.json({ data: expenses, count: expenses.length, limit, offset })
}
