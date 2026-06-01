import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { isShippoConfigured } from '@/lib/shipping/shippo'
import { CheckoutClient, HostedFallbackButton } from './checkout-client'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false },
}

export default async function MerchCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; productId: string }>
  searchParams: Promise<{ qty?: string }>
}) {
  const { orgSlug, productId } = await params
  const { qty } = await searchParams

  const admin = createAdminClient()
  const { data: org } = await admin
    .from('organizations')
    .select('id, name, slug, ship_from_line1')
    .eq('slug', orgSlug)
    .maybeSingle()
  if (!org) notFound()

  const { data: product } = await admin
    .from('merch_products')
    .select('id, name, description, price, image_url, active, category')
    .eq('id', productId)
    .eq('org_id', org.id)
    .maybeSingle()
  if (!product || !product.active) notFound()

  const quantity = Math.min(Math.max(Number(qty) || 1, 1), 10)

  const stripePublishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  const shippoReady = isShippoConfigured() && !!org.ship_from_line1

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href={`/store/${orgSlug}`}
          className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
        >
          <ArrowLeft className="size-3" aria-hidden /> Back to store
        </Link>
        <h1 className="mb-2 text-2xl font-bold">Checkout</h1>
        <p className="mb-6 text-sm text-text-secondary">
          {org.name} &middot; {product.name} &middot; ${Number(product.price).toFixed(2)} ×{' '}
          {quantity}
        </p>

        {!shippoReady ? (
          <FallbackToHostedCheckout
            orgSlug={orgSlug}
            productId={productId}
            quantity={quantity}
            reason={
              !isShippoConfigured()
                ? 'Live shipping rates are not configured for this store yet.'
                : 'This store has not set a ship-from address yet.'
            }
          />
        ) : (
          <CheckoutClient
            orgSlug={orgSlug}
            productId={productId}
            productName={product.name}
            productPriceCents={Math.round(Number(product.price) * 100)}
            quantity={quantity}
            stripePublishableKey={stripePublishableKey}
          />
        )}
      </main>
      <SiteFooter />
    </>
  )
}

function FallbackToHostedCheckout({
  orgSlug,
  productId,
  quantity,
  reason,
}: {
  orgSlug: string
  productId: string
  quantity: number
  reason: string
}) {
  return (
    <div className="rounded-xl border border-warning-500/30 bg-warning-500/5 p-5">
      <p className="text-sm">
        <strong className="text-warning-700 dark:text-warning-400">
          Heads up:
        </strong>{' '}
        {reason} Falling back to Stripe&apos;s hosted checkout with flat-rate
        shipping.
      </p>
      <div className="mt-3">
        <HostedFallbackButton
          orgSlug={orgSlug}
          productId={productId}
          quantity={quantity}
        />
      </div>
    </div>
  )
}
