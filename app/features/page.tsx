import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import { featurePages, getAllFeatureSlugs } from '@/lib/modules/feature-data'

export const metadata: Metadata = {
  title: 'Modules — Tour Manager OS',
  description:
    'Every Tour Manager OS module in one place. Advance sheets, finances, ticketing, merch, fan engagement, wellness, and more.',
  openGraph: {
    title: 'Modules — Tour Manager OS',
    description:
      'Every Tour Manager OS module in one place. Pick what your band needs.',
  },
}

export default function FeaturesIndexPage() {
  const modules = getAllFeatureSlugs().map((slug) => ({
    slug,
    ...featurePages[slug],
  }))

  return (
    <>
      <Header />
      <main
        id="main-content"
        className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20"
      >
        <header className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Modules</h1>
          <p className="mx-auto max-w-xl text-text-secondary">
            Tour Manager OS is built as modules. Turn on what your band
            needs and skip the rest. Here is everything you can use.
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/features/${m.slug}`}
                className="group flex h-full flex-col rounded-xl border border-border-default bg-surface-raised p-5 transition-colors hover:border-primary-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">{m.name}</h2>
                  {m.status === 'coming-soon' && (
                    <span className="rounded-full bg-warning-500/20 px-2 py-0.5 text-xs font-medium text-warning-600 dark:text-warning-500">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mb-3 text-sm font-medium text-primary-600 dark:text-primary-400">
                  {m.tagline}
                </p>
                <p className="mb-4 text-sm text-text-secondary">
                  {m.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-text-primary">
                  Learn more
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-text-secondary">
            Want to see it with real data first?
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login?demo=true"
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              Try the demo
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg border border-border-default px-6 py-3 text-sm font-medium transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              Sign up
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
