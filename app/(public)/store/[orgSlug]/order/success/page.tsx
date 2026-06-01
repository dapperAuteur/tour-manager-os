import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import { getOrderByStripeSession } from '@/lib/merch/public-store'

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false },
}

export default async function StoreOrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const { orgSlug } = await params
  const { session_id } = await searchParams

  // The webhook is async — it may not have inserted the row yet. Retry
  // a couple of times before showing the generic "we've got it" fallback.
  let order = session_id ? await getOrderByStripeSession(session_id) : null
  if (!order && session_id) {
    await new Promise((r) => setTimeout(r, 800))
    order = await getOrderByStripeSession(session_id)
  }

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-success-500/30 bg-success-500/5 p-8 text-center">
          <CheckCircle2
            className="mx-auto mb-3 size-10 text-success-600 dark:text-success-500"
            aria-hidden
          />
          <h1 className="text-2xl font-bold">Order confirmed</h1>
          {order ? (
            <>
              <p className="mt-2 text-sm text-text-secondary">
                Thanks{order.fan_name ? `, ${order.fan_name}` : ''}.
                Your order <strong>{order.order_number}</strong> is paid and
                queued for fulfillment. A receipt has been emailed to{' '}
                <strong>{order.fan_email}</strong>.
              </p>
              <ul className="mt-6 space-y-1 text-left text-sm">
                {order.items.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-border-default bg-surface p-3"
                  >
                    <span>
                      {it.quantity} &times; {it.product_name}
                    </span>
                    <span className="font-medium">
                      ${it.subtotal.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-right text-sm">
                <span className="text-text-muted">Total paid:</span>{' '}
                <strong>${order.total_amount.toFixed(2)}</strong>
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">
              We&apos;ve received your payment. Your confirmation email is on
              the way — usually within a minute. If you don&apos;t see it in
              5 minutes, check spam.
            </p>
          )}
          <Link
            href={`/store/${orgSlug}`}
            className="mt-6 inline-flex items-center gap-1 rounded-md border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt"
          >
            Back to store
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
