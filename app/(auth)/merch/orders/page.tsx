import type { Metadata } from 'next'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { listMerchOrders } from '@/lib/merch/orders'
import { FulfillForm } from './fulfill-form'

export const metadata: Metadata = {
  title: 'Merch Orders',
  robots: { index: false },
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-warning-500/20 text-warning-700 dark:text-warning-400',
  fulfilled: 'bg-success-500/20 text-success-700 dark:text-success-500',
  refunded: 'bg-text-muted/20 text-text-muted',
  cancelled: 'bg-error-500/20 text-error-600 dark:text-error-500',
}

function formatAddress(addr: Record<string, unknown> | null): string {
  if (!addr || typeof addr !== 'object') return ''
  const a = (addr as { address?: Record<string, unknown>; name?: string })
    .address
  if (!a) return ''
  const parts = [a.line1, a.line2, a.city, a.state, a.postal_code, a.country]
    .filter(Boolean)
    .map(String)
  return parts.join(', ')
}

export default async function MerchOrdersPage() {
  const orders = await listMerchOrders()

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/merch"
        className="mb-3 inline-block text-sm text-text-muted hover:text-text-secondary"
      >
        &larr; Merch
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Package className="size-5" aria-hidden /> Merch Orders
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Fan purchases via the public store. Paid orders await
          fulfillment; mark them shipped with a tracking number and the
          fan&apos;s email gets updated automatically (TODO — emails
          coming soon).
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-10 text-center">
          <Package
            className="mx-auto mb-3 size-8 text-text-muted"
            aria-hidden
          />
          <p className="text-sm text-text-secondary">
            No orders yet. Share your store link with fans:{' '}
            <code className="rounded bg-surface-alt px-2 py-0.5 text-xs">
              /store/&lt;your-org-slug&gt;
            </code>
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-xl border border-border-default bg-surface-raised p-4"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold">
                    {o.order_number}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(o.created_at).toLocaleString()} &middot;{' '}
                    {o.fan_name || o.fan_email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[o.status]}`}
                  >
                    {o.status}
                  </span>
                  <span className="font-semibold">
                    ${o.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <ul className="mb-2 space-y-0.5 text-sm">
                {o.items.map((it, i) => (
                  <li key={i} className="text-text-secondary">
                    {it.quantity} &times; {it.product_name}{' '}
                    <span className="text-text-muted">
                      (${it.subtotal.toFixed(2)})
                    </span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-text-muted">
                <span className="font-medium text-text-secondary">Ship to:</span>{' '}
                {formatAddress(o.shipping_address) || (
                  <em>no shipping address</em>
                )}
              </p>

              {o.status === 'paid' && (
                <div className="mt-3 border-t border-border-default pt-3">
                  <FulfillForm orderId={o.id} />
                </div>
              )}
              {o.status === 'fulfilled' && o.tracking_number && (
                <p className="mt-2 text-xs text-text-muted">
                  <span className="font-medium text-text-secondary">Tracking:</span>{' '}
                  {o.tracking_number}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
