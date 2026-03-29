import type { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, Plus, DollarSign, Package, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getMerchDashboard } from '@/lib/merch/queries'

export const metadata: Metadata = {
  title: 'Merch',
  robots: { index: false },
}

export default async function MerchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-4 text-2xl font-bold">Merch</h1>
        <p className="text-text-secondary">Create an organization first to manage merch.</p>
      </main>
    )
  }

  const data = await getMerchDashboard(orgMembership.org_id)
  const fmt = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Merch</h1>
        <div className="flex gap-2">
          <Link
            href="/merch/sales/new"
            className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <DollarSign className="h-4 w-4" aria-hidden="true" />
            Record Sale
          </Link>
          <Link
            href="/merch/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Revenue</p>
            <TrendingUp className="h-5 w-5 text-success-600 dark:text-success-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(data.totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Cost</p>
            <Package className="h-5 w-5 text-text-muted" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{fmt(data.totalCost)}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Profit</p>
            <DollarSign className={`h-5 w-5 ${data.totalProfit >= 0 ? 'text-success-600 dark:text-success-500' : 'text-error-500'}`} aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{data.totalProfit < 0 ? '-' : ''}{fmt(data.totalProfit)}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Units Sold</p>
            <ShoppingBag className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold">{data.totalUnitsSold.toLocaleString()}</p>
        </div>
      </div>

      {/* Top sellers */}
      {Object.keys(data.salesByProduct).length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Top Sellers</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(data.salesByProduct)
              .sort((a, b) => b.revenue - a.revenue)
              .map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border border-border-default bg-surface-raised px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-text-muted">{item.units} units</p>
                  </div>
                  <span className="text-sm font-semibold">{fmt(item.revenue)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Products */}
      <h2 className="mb-4 text-lg font-semibold">Products ({data.products.length})</h2>
      {data.products.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No products yet. Add your first merch item.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.products.map((product) => {
            const inventory = Array.isArray(product.merch_inventory) ? product.merch_inventory : []
            const totalRemaining = inventory.reduce((sum: number, inv: { quantity_remaining: number }) => sum + inv.quantity_remaining, 0)
            const totalStart = inventory.reduce((sum: number, inv: { quantity_start: number }) => sum + inv.quantity_start, 0)

            return (
              <div key={product.id} className="rounded-xl border border-border-default bg-surface-raised p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    {product.sku && <p className="text-xs text-text-muted">SKU: {product.sku}</p>}
                  </div>
                  <span className="text-lg font-bold">{fmt(Number(product.price))}</span>
                </div>
                {product.description && (
                  <p className="mb-3 text-sm text-text-secondary">{product.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  {product.category && (
                    <span className="rounded-full bg-surface-alt px-2 py-0.5 capitalize">{product.category}</span>
                  )}
                  {totalStart > 0 && (
                    <span>{totalRemaining}/{totalStart} remaining</span>
                  )}
                  {product.cost_basis && (
                    <span>Cost: {fmt(Number(product.cost_basis))}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
