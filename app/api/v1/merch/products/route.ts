import { createAdminClient } from '@/lib/supabase/admin'
import { requireApiKey, logApiRequest, jsonError } from '@/lib/api/auth'

/**
 * GET /api/v1/merch/products
 * Lists merch products for the API key's org. Supports `active` filter
 * (true/false) and `category` filter.
 */
export async function GET(request: Request) {
  const start = Date.now()
  const auth = await requireApiKey(request, 'read')
  if (auth instanceof Response) return auth
  const apiKey = auth

  const { searchParams } = new URL(request.url)
  const activeFilter = searchParams.get('active')
  const category = searchParams.get('category')

  const supabase = createAdminClient()

  let query = supabase
    .from('merch_products')
    .select('id, name, description, sku, category, price, cost_basis, image_url, active, weight_oz, length_in, width_in, height_in, created_at')
    .eq('org_id', apiKey.org_id)
    .order('name')

  if (activeFilter === 'true') query = query.eq('active', true)
  if (activeFilter === 'false') query = query.eq('active', false)
  if (category) query = query.eq('category', category)

  const { data, error } = await query

  await logApiRequest(
    apiKey.id,
    'GET',
    '/api/v1/merch/products',
    error ? 500 : 200,
    Date.now() - start,
  )

  if (error) return jsonError(error.message, 500)
  return Response.json({ data, count: data.length })
}
