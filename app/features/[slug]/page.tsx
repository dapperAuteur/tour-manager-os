import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFeaturePageData, getAllFeatureSlugs } from '@/lib/modules/feature-data'
import { Header } from '@/components/layout/header'

export function generateStaticParams() {
  return getAllFeatureSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = getFeaturePageData(slug)
  if (!data) return { title: 'Feature Not Found' }
  return {
    title: `${data.name} — Tour Manager OS`,
    description: data.description,
    openGraph: {
      title: `${data.name} — Tour Manager OS`,
      description: data.description,
    },
  }
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = getFeaturePageData(slug)
  if (!data) notFound()

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 text-center sm:py-20">
          {data.status === 'coming-soon' && (
            <span className="mb-4 inline-block rounded-full bg-warning-500/20 px-3 py-1 text-xs font-medium text-warning-600 dark:text-warning-500">
              Coming Soon
            </span>
          )}
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl">{data.name}</h1>
          <p className="mb-2 text-lg text-primary-600 dark:text-primary-400">{data.tagline}</p>
          <p className="mx-auto mb-8 max-w-xl text-text-secondary">{data.description}</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?demo=true"
              className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              Try in Demo
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg border border-border-default px-6 py-3 text-sm font-medium transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              Sign Up
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12">
          <h2 className="mb-8 text-center text-2xl font-bold">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {data.benefits.map((b, i) => (
              <div key={b.title} className="rounded-xl border border-border-default bg-surface-raised p-6">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{b.title}</h3>
                <p className="text-sm text-text-secondary">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* User types */}
        <section className="py-12">
          <h2 className="mb-4 text-center text-2xl font-bold">Built For</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {data.userTypes.map((ut) => (
              <span key={ut} className="rounded-full border border-border-default bg-surface-raised px-4 py-2 text-sm">
                {ut}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border-default py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">See it in action</h2>
          <p className="mb-6 text-text-secondary">Try the full demo with realistic data. No signup required.</p>
          <Link
            href="/login?demo=true"
            className="inline-flex items-center rounded-lg bg-primary-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            Try the Demo Free
          </Link>
        </section>

        {/* Footer nav */}
        <footer className="border-t border-border-default py-8 text-center text-sm text-text-muted">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:text-text-secondary">Home</Link>
            <Link href="/roadmap" className="hover:text-text-secondary">Roadmap</Link>
            <Link href="/login" className="hover:text-text-secondary">Log In</Link>
            <Link href="/signup" className="hover:text-text-secondary">Sign Up</Link>
          </div>
          <p className="mt-4">Tour Manager OS</p>
        </footer>
      </main>
    </>
  )
}
