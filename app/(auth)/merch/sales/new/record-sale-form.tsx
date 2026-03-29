'use client'

import { useState } from 'react'
import { recordSale } from '@/lib/merch/actions'

interface Product {
  id: string
  name: string
  price: number
  sku: string | null
}

interface Show {
  id: string
  date: string
  city: string
  state: string | null
  venue_name: string | null
  tour_id: string
}

export function RecordSaleForm({ products, shows }: { products: Product[]; shows: Show[] }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedShow, setSelectedShow] = useState<Show | null>(null)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await recordSale(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>
      )}

      <div>
        <label htmlFor="product_id" className="mb-1 block text-sm font-medium">
          Product <span className="text-error-500">*</span>
        </label>
        <select
          id="product_id"
          name="product_id"
          required
          onChange={(e) => setSelectedProduct(products.find((p) => p.id === e.target.value) || null)}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        >
          <option value="">Select product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.sku ? `(${p.sku})` : ''} — ${Number(p.price).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="show_id" className="mb-1 block text-sm font-medium">Show</label>
        <select
          id="show_id"
          name="show_id"
          onChange={(e) => setSelectedShow(shows.find((s) => s.id === e.target.value) || null)}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        >
          <option value="">Online / no specific show</option>
          {shows.map((s) => (
            <option key={s.id} value={s.id}>
              {new Date(s.date).toLocaleDateString()} — {s.venue_name || s.city}{s.state ? `, ${s.state}` : ''}
            </option>
          ))}
        </select>
        {/* Hidden tour_id from selected show */}
        <input type="hidden" name="tour_id" value={selectedShow?.tour_id || shows[0]?.tour_id || ''} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
            Quantity <span className="text-error-500">*</span>
          </label>
          <input id="quantity" name="quantity" type="number" min="1" required defaultValue={1} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="unit_price" className="mb-1 block text-sm font-medium">
            Unit Price ($) <span className="text-error-500">*</span>
          </label>
          <input
            id="unit_price"
            name="unit_price"
            type="number"
            step="0.01"
            min="0"
            required
            value={selectedProduct ? Number(selectedProduct.price).toFixed(2) : ''}
            onChange={() => {}}
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface">
        {loading ? 'Recording...' : 'Record Sale'}
      </button>
    </form>
  )
}
