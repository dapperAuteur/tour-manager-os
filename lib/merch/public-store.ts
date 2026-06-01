import { createAdminClient } from '@/lib/supabase/admin'

export interface PublicStoreProduct {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  image_url: string | null
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
    .select('id, name, description, category, price, image_url')
    .eq('org_id', org.id)
    .eq('active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return {
    org_id: org.id,
    org_name: org.name,
    org_slug: org.slug,
    logo_url: org.logo_url as string | null,
    products: (products || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: Number(p.price),
      image_url: p.image_url,
    })),
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
