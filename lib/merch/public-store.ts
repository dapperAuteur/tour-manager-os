import { createAdminClient } from '@/lib/supabase/admin'

export interface PublicStoreProduct {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  image_url: string | null
  is_exclusive: boolean
  drop_tour_name: string | null
  drop_ends_at: string | null
}

export interface PublicStore {
  org_id: string
  org_name: string
  org_slug: string
  logo_url: string | null
  products: PublicStoreProduct[]
}

export async function getPublicStore(orgSlug: string): Promise<PublicStore | null> {
  const admin = createAdminClient()
  const { data: org } = await admin
    .from('organizations')
    .select('id, name, slug, logo_url')
    .eq('slug', orgSlug)
    .maybeSingle()
  if (!org) return null

  const { data: products } = await admin
    .from('merch_products')
    .select(
      `id, name, description, category, price, image_url,
       is_exclusive, drop_starts_at, drop_ends_at,
       drop_tour:drop_tour_id(name, end_date)`,
    )
    .eq('org_id', org.id)
    .eq('active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  const now = Date.now()
  const filtered = (products || []).filter((p) => {
    if (!p.is_exclusive) return true
    const starts = p.drop_starts_at ? new Date(p.drop_starts_at as string).getTime() : null
    const ends = p.drop_ends_at ? new Date(p.drop_ends_at as string).getTime() : null
    const tour = p.drop_tour as unknown as { name: string; end_date: string | null } | null
    const tourEnds = tour?.end_date
      ? new Date(tour.end_date).getTime() + 24 * 60 * 60 * 1000
      : null
    if (starts && now < starts) return false
    if (ends && now >= ends) return false
    // If the drop is tied to a tour with no explicit window, gate by the
    // tour's end_date so old-tour merch quietly disappears.
    if (!starts && !ends && tourEnds && now >= tourEnds) return false
    return true
  })

  return {
    org_id: org.id,
    org_name: org.name,
    org_slug: org.slug,
    logo_url: org.logo_url as string | null,
    products: filtered.map((p) => {
      const tour = p.drop_tour as unknown as { name: string; end_date: string | null } | null
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: Number(p.price),
        image_url: p.image_url,
        is_exclusive: !!p.is_exclusive,
        drop_tour_name: tour?.name ?? null,
        drop_ends_at: (p.drop_ends_at as string | null) ?? null,
      }
    }),
  }
}

export interface OrderConfirmation {
  order_number: string
  fan_email: string
  fan_name: string | null
  total_amount: number
  items: { product_name: string; quantity: number; subtotal: number }[]
}

export async function getOrderByStripeSession(
  sessionId: string,
): Promise<OrderConfirmation | null> {
  const admin = createAdminClient()
  const { data: order } = await admin
    .from('merch_orders')
    .select(`
      order_number, fan_email, fan_name, total_amount,
      merch_order_items(product_name, quantity, subtotal)
    `)
    .eq('stripe_session_id', sessionId)
    .maybeSingle()
  if (!order) return null

  return {
    order_number: order.order_number,
    fan_email: order.fan_email,
    fan_name: order.fan_name as string | null,
    total_amount: Number(order.total_amount),
    items: (order.merch_order_items as unknown as Array<{
      product_name: string
      quantity: number
      subtotal: number | string
    }>).map((it) => ({
      product_name: it.product_name,
      quantity: it.quantity,
      subtotal: Number(it.subtotal),
    })),
  }
}
