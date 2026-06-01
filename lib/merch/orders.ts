import { createClient } from '@/lib/supabase/server'

export interface MerchOrderRow {
  id: string
  order_number: string
  fan_email: string
  fan_name: string | null
  total_amount: number
  status: 'paid' | 'fulfilled' | 'refunded' | 'cancelled'
  tracking_number: string | null
  fulfilled_at: string | null
  created_at: string
  shipping_address: Record<string, unknown> | null
  items: { product_name: string; quantity: number; subtotal: number }[]
}

export async function listMerchOrders(): Promise<MerchOrderRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('merch_orders')
    .select(`
      id, order_number, fan_email, fan_name, total_amount, status,
      tracking_number, fulfilled_at, created_at, shipping_address,
      merch_order_items(product_name, quantity, subtotal)
    `)
    .order('status')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error || !data) return []
  return data.map((row) => ({
    id: row.id,
    order_number: row.order_number,
    fan_email: row.fan_email,
    fan_name: row.fan_name,
    total_amount: Number(row.total_amount),
    status: row.status as MerchOrderRow['status'],
    tracking_number: row.tracking_number,
    fulfilled_at: row.fulfilled_at as string | null,
    created_at: row.created_at as string,
    shipping_address: row.shipping_address as Record<string, unknown> | null,
    items: (row.merch_order_items as unknown as Array<{
      product_name: string
      quantity: number
      subtotal: number | string
    }>).map((it) => ({
      product_name: it.product_name,
      quantity: it.quantity,
      subtotal: Number(it.subtotal),
    })),
  }))
}
