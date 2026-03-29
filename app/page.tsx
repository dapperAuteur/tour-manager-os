import Link from 'next/link'
import { Music, FileSpreadsheet, DollarSign, Calendar, ShoppingBag, Users } from 'lucide-react'
import { Header } from '@/components/layout/header'

const features = [
  {
    icon: FileSpreadsheet,
    title: 'Digital Advance Sheets',
    description: 'Smart web forms that venues fill out online. No more emailing spreadsheets.',
  },
  {
    icon: Calendar,
    title: 'Auto-Generated Itineraries',
    description: 'Daily schedules built automatically from venue data. Print or view on any device.',
  },
  {
    icon: DollarSign,
    title: 'Tour Finances',
    description: 'Real-time P&L per show. Receipt capture, expense tracking, and tax-ready exports.',
  },
  {
    icon: Music,
    title: 'Show Day Companion',
    description: 'Open your phone, see your whole day. Soundcheck, doors, showtime — all at a glance.',
  },
  {
    icon: ShoppingBag,
    title: 'Merch Management',
    description: 'Inventory tracking, per-show sales, and an online store for fans.',
  },
  {
    icon: Users,
    title: 'Fan Engagement',
    description: 'Marketing emails, exclusive content, community forums, and event pages.',
  },
]

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="flex flex-col items-center gap-6 py-16 text-center sm:py-24"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900">
            <Music className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <h1
            id="hero-heading"
            className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Tour Management Built for Musicians
          </h1>
          <p className="max-w-xl text-lg text-text-secondary">
            Replace spreadsheets, printed itineraries, and fragmented tools with one
            platform that works — even offline.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              Get Started
            </Link>
            <Link
              href="/login?demo=true"
              className="inline-flex items-center justify-center rounded-lg border border-border-default px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              Try Demo
            </Link>
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="features-heading" className="py-16">
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-border-default bg-surface-raised p-6 transition-shadow hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
                  <feature.icon
                    className="h-5 w-5 text-primary-600 dark:text-primary-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-default py-8 text-center text-sm text-text-muted">
          <p>Tour Manager OS</p>
        </footer>
      </main>
    </>
  )
}
