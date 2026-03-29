import Link from 'next/link'
import { Header } from '@/components/layout/header'

interface Benefit {
  title: string
  description: string
}

interface LandingPageProps {
  title: string
  subtitle: string
  description: string
  benefits: Benefit[]
  demoRole?: string
  demoLabel: string
  modules: string[]
}

export function LandingPage({ title, subtitle, description, benefits, demoLabel, modules }: LandingPageProps) {
  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 text-center sm:py-24">
          <p className="mb-3 text-sm font-medium text-primary-600 dark:text-primary-400">{subtitle}</p>
          <h1 className="mx-auto mb-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-text-secondary">
            {description}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/login?demo=true`}
              className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              {demoLabel}
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
        <section aria-labelledby="benefits-heading" className="py-16">
          <h2 id="benefits-heading" className="mb-8 text-center text-2xl font-bold">What You Get</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl border border-border-default bg-surface-raised p-6">
                <h3 className="mb-2 text-lg font-semibold">{b.title}</h3>
                <p className="text-sm text-text-secondary">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Modules */}
        <section aria-labelledby="modules-heading" className="py-16">
          <h2 id="modules-heading" className="mb-8 text-center text-2xl font-bold">Key Modules</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {modules.map((m) => (
              <Link
                key={m}
                href={`/features/${m.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-full border border-border-default bg-surface-raised px-4 py-2 text-sm font-medium transition-colors hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {m}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border-default py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to try it?</h2>
          <p className="mb-6 text-text-secondary">No credit card required. See real data, real features.</p>
          <Link
            href={`/login?demo=true`}
            className="inline-flex items-center rounded-lg bg-primary-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            Try the Demo Free
          </Link>
        </section>

        {/* Footer */}
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
