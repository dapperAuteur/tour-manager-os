import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import { getPublicStore } from '@/lib/merch/public-store'
import { BuyButton } from './buy-button'

interface PageProps {
  params: Promise<{ orgSlug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { orgSlug } = await params
  const store = await getPublicStore(orgSlug)
  if (!store) return { title: 'Store' }
  return {
    title: `${store.org_name} — Merch Store`,
    description: `Official merch from ${store.org_name}. T-shirts, vinyl, posters, and more.`,
    openGraph: {
      title: `${store.org_name} — Merch Store`,
      description: `Official merch from ${store.org_name}.`,
      type: 'website',
    },
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  apparel: 'Apparel',
  vinyl: 'Vinyl',
  cd: 'CDs',
  poster: 'Posters',
  accessory: 'Accessories',
  bundle: 'Bundles',
  other: 'Other',
}

export default async function StorePage({ params }: PageProps) {
  const { orgSlug } = await params
  const store = await getPublicStore(orgSlug)
  if (!store) notFound()

  // Group products by category for scanability.
  const grouped = new Map<string, typeof store.products>()
  for (const p of store.products) {
    const key = p.category || 'other'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(p)
  }

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-10 text-center">
          {store.logo_url && (
            <Image
              src={store.logo_url}
              alt={`${store.org_name} logo`}
              width={80}
              height={80}
              className="mx-auto mb-3 size-16 rounded-xl object-cover"
              unoptimized
            />
          )}
          <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            <ShoppingBag className="size-3.5" aria-hidden /> Official Merch
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{store.org_name}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Buy direct. Ships in 5-10 business days. International shipping
            to most countries.
          </p>
        </header>

        {store.products.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface-raised p-10 text-center">
            <ShoppingBag
              className="mx-auto mb-3 size-8 text-text-muted"
              aria-hidden
            />
            <p className="text-sm text-text-secondary">
              No products available yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Array.from(grouped.entries()).map(([category, items]) => (
              <section
                key={category}
                aria-labelledby={`cat-${category}`}
                className="space-y-3"
              >
                <h2
                  id={`cat-${category}`}
                  className="text-sm font-semibold uppercase tracking-wider text-text-muted"
                >
                  {CATEGORY_LABELS[category] || category}
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-xl border border-border-default bg-surface-raised p-4"
                    >
                      <div className="mb-3 aspect-square overflow-hidden rounded-md bg-surface-alt">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            width={400}
                            height={400}
                            className="size-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ShoppingBag
                              className="size-10 text-text-muted/40"
                              aria-hidden
                            />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold">{p.name}</p>
                      {p.description && (
                        <p className="mt-1 text-xs text-text-secondary">
                          {p.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-lg font-bold">
                          ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <BuyButton
                          orgSlug={store.org_slug}
                          productId={p.id}
                          productName={p.name}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-text-muted">
          Payments processed by Stripe. We never see your card details.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
