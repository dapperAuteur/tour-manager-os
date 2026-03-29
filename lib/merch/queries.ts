import { createClient } from '@/lib/supabase/server'

export async function getMerchProducts(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('merch_products')
    .select('*, merch_inventory(*)')
    .eq('org_id', orgId)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getMerchSalesForTour(tourId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('merch_sales')
    .select('*, merch_products(name, sku, category, image_url), shows(date, city, state, venue_name)')
    .eq('tour_id', tourId)
    .order('sold_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getMerchDashboard(orgId: string) {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('merch_products')
    .select('*, merch_inventory(*), merch_sales(*)')
    .eq('org_id', orgId)

  const allProducts = products || []

  let totalRevenue = 0
  let totalCost = 0
  let totalUnitsSold = 0
  const salesByProduct: Record<string, { name: string; units: number; revenue: number }> = {}

  for (const p of allProducts) {
    const sales = Array.isArray(p.merch_sales) ? p.merch_sales : []
    const productRevenue = sales.reduce((sum: number, s: { total: number | null }) => sum + Number(s.total || 0), 0)
    const productUnits = sales.reduce((sum: number, s: { quantity: number }) => sum + s.quantity, 0)
    const productCost = (Number(p.cost_basis) || 0) * productUnits

    totalRevenue += productRevenue
    totalCost += productCost
    totalUnitsSold += productUnits

    if (productUnits > 0) {
      salesByProduct[p.id] = { name: p.name, units: productUnits, revenue: productRevenue }
    }
  }

  return {
    products: allProducts,
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    totalUnitsSold,
    salesByProduct,
  }
}
