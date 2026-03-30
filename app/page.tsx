import Link from 'next/link'
import { Music, FileSpreadsheet, DollarSign, Calendar, ShoppingBag, Users, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'

const features = [
  {
    icon: FileSpreadsheet,
    title: 'Digital Advance Sheets',
    description: 'Smart web forms that venues fill out online. No more emailing spreadsheets.',
    slug: 'advance-sheets',
  },
  {
    icon: Calendar,
    title: 'Auto-Generated Itineraries',
    description: 'Daily schedules built automatically from venue data. Print or view on any device.',
    slug: 'itineraries',
  },
  {
    icon: DollarSign,
    title: 'Tour Finances',
    description: 'Real-time P&L per show. Receipt capture, expense tracking, and tax-ready exports.',
    slug: 'tour-finances',
  },
  {
    icon: Music,
    title: 'Show Day Companion',
    description: 'Open your phone, see your whole day. Soundcheck, doors, showtime — all at a glance.',
    slug: 'show-day',
  },
  {
    icon: ShoppingBag,
    title: 'Merch Management',
    description: 'Inventory tracking, per-show sales, and an online store for fans.',
    slug: 'merch-management',
  },
  {
    icon: Users,
    title: 'Fan Engagement',
    description: 'Marketing emails, exclusive content, community forums, and event pages.',
    slug: 'fan-engagement',
  },
]

const userTypes = [
  { label: 'Tour Managers', href: '/for/tour-managers', description: 'Run the show from one dashboard' },
  { label: 'Musicians', href: '/for/musicians', description: 'Know your day, know your money' },
  { label: 'Crew', href: '/for/crew', description: 'Every production detail, one app' },
  { label: 'Venues', href: '/for/venues', description: 'One form, no login required' },
  { label: 'Fans', href: '/for/fans', description: 'Exclusive content and community' },
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
              href="/signup"
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
          <h2 id="features-heading" className="mb-8 text-center text-2xl font-bold">
            Everything You Need on the Road
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.slug}
                href={`/features/${feature.slug}`}
                className="group rounded-xl border border-border-default bg-surface-raised p-6 transition-all hover:border-primary-500/50 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
                  <feature.icon
                    className="h-5 w-5 text-primary-600 dark:text-primary-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {feature.title}
                </h3>
                <p className="mb-3 text-sm text-text-secondary">{feature.description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                  Learn more <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* User types */}
        <section aria-labelledby="users-heading" className="py-16">
          <h2 id="users-heading" className="mb-3 text-center text-2xl font-bold">
            Built for Every Role
          </h2>
          <p className="mb-8 text-center text-text-secondary">
            Whether you manage the tour, play the show, or run the production — there&apos;s a view for you.
          </p>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {userTypes.map((ut) => (
              <Link
                key={ut.href}
                href={ut.href}
                className="rounded-xl border border-border-default bg-surface-raised p-5 text-center transition-all hover:border-primary-500/50 hover:shadow-sm"
              >
                <p className="font-semibold">{ut.label}</p>
                <p className="mt-1 text-xs text-text-muted">{ut.description}</p>
              </Link>
            ))}
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
