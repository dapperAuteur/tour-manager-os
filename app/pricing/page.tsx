import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Star, Music, Users, Wrench, MapPin, Heart } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'One price. All features. No surprises. Tour Manager OS for touring musicians.',
  openGraph: {
    title: 'Pricing — Tour Manager OS',
    description: 'One price. All features. No surprises.',
  },
}

const roles = [
  {
    icon: Music,
    title: 'Artists',
    description: 'Manage your own touring — schedule, finances, merch, fan engagement. Everything in one place.',
    modules: ['Show Day', 'Finances', 'Merch', 'Marketing'],
  },
  {
    icon: Users,
    title: 'Tour Managers',
    description: 'Run tours for your artists — advance sheets, itineraries, team management, budgets.',
    modules: ['Advance Sheets', 'Itineraries', 'Finances', 'Production'],
  },
  {
    icon: Music,
    title: 'Band Members',
    description: 'See your daily schedule, track personal finances, collaborate on setlists, stay healthy on the road.',
    modules: ['Show Day', 'My Finances', 'Setlists', 'Wellness'],
  },
  {
    icon: Wrench,
    title: 'Crew',
    description: 'Production specs, stage plots, input lists, equipment inventory, and venue notes that persist.',
    modules: ['Production Bible', 'Show Day', 'Documents', 'Venue Notes'],
  },
  {
    icon: MapPin,
    title: 'Venue Contacts',
    description: 'Fill out advance sheets online — no login required. Your venue data saves for future shows.',
    modules: ['Advance Sheets'],
  },
  {
    icon: Heart,
    title: 'Fans',
    description: 'Exclusive content, merch store, community forums, and show notifications.',
    modules: ['Community', 'Merch Store', 'Events'],
  },
]

async function getLifetimeStats() {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('subscriptions')
      .select('type, status')

    const allSubs = data || []
    const paidLifetime = allSubs.filter((s) => s.type === 'lifetime' && s.status === 'active').length
    return { paidLifetime, remaining: 100 - paidLifetime, showAnnual: paidLifetime >= 100 }
  } catch {
    return { paidLifetime: 0, remaining: 100, showAnnual: false }
  }
}

export default async function PricingPage() {
  const stats = await getLifetimeStats()

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 text-center sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One Price. All Features. No Surprises.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-text-secondary">
            Everything you need to manage tours, finances, merch, and your team — in one platform.
          </p>
        </section>

        {/* Single pricing card */}
        <section className="mx-auto max-w-md">
          <div className="rounded-2xl border-2 border-primary-500 bg-primary-500/5 p-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400">
              <Star className="h-4 w-4" aria-hidden="true" />
              {stats.showAnnual ? 'Annual Membership' : 'Lifetime Membership'}
            </div>

            <div className="mb-2">
              <span className="text-5xl font-bold">$103.29</span>
              <span className="text-text-muted">{stats.showAnnual ? ' /year' : ' one-time'}</span>
            </div>

            <p className="mb-6 text-sm text-text-secondary">
              {stats.showAnnual
                ? 'Renews annually. Cancel anytime.'
                : `Pay once, access forever. ${stats.remaining} of 100 spots remaining.`
              }
            </p>

            <ul className="mb-8 space-y-3 text-left text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success-600 dark:text-success-500" aria-hidden="true" /> All modules — no feature limits</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success-600 dark:text-success-500" aria-hidden="true" /> Full CRUD — create, edit, duplicate, delete</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success-600 dark:text-success-500" aria-hidden="true" /> CSV import/export and PDF reports</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success-600 dark:text-success-500" aria-hidden="true" /> API access for integrations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success-600 dark:text-success-500" aria-hidden="true" /> Priority support</li>
              {!stats.showAnnual && (
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success-600 dark:text-success-500" aria-hidden="true" /> Never expires — lifetime access</li>
              )}
            </ul>

            <Link
              href="/signup"
              className="block w-full rounded-lg bg-primary-600 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
            >
              Get Started
            </Link>

            <p className="mt-3 text-xs text-text-muted">
              Free to sign up. Pay when you&apos;re ready.
            </p>
          </div>
        </section>

        {/* Built for every role */}
        <section className="py-16" aria-labelledby="roles-heading">
          <h2 id="roles-heading" className="mb-3 text-center text-2xl font-bold">Built for Every Role</h2>
          <p className="mb-10 text-center text-text-secondary">
            Choose your role when you sign up. We&apos;ll tailor the experience to what you need most.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div key={role.title} className="rounded-xl border border-border-default bg-surface-raised p-6">
                <role.icon className="mb-3 h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                <h3 className="mb-2 text-lg font-semibold">{role.title}</h3>
                <p className="mb-4 text-sm text-text-secondary">{role.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.modules.map((mod) => (
                    <span key={mod} className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-text-muted">{mod}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border-default py-16" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-8 text-center text-2xl font-bold">Common Questions</h2>
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <h3 className="font-semibold">Can I try it before paying?</h3>
              <p className="mt-1 text-sm text-text-secondary">Yes — click &ldquo;Try Demo&rdquo; to explore with realistic data. No signup required.</p>
            </div>
            <div>
              <h3 className="font-semibold">What&apos;s the difference between lifetime and annual?</h3>
              <p className="mt-1 text-sm text-text-secondary">We&apos;re selling the first 100 memberships as lifetime (pay once, access forever). After those sell out, we switch to annual at the same price.</p>
            </div>
            <div>
              <h3 className="font-semibold">Can free users access the app?</h3>
              <p className="mt-1 text-sm text-text-secondary">Free users get read-only access. Paid members get full CRUD — create, edit, duplicate, and delete across all modules.</p>
            </div>
            <div>
              <h3 className="font-semibold">Can I invite band members who aren&apos;t paid?</h3>
              <p className="mt-1 text-sm text-text-secondary">Yes. Tour managers can invite members as read-only. They can view schedules and data but can&apos;t edit until they upgrade.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border-default py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to simplify your tours?</h2>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup" className="inline-flex items-center rounded-lg bg-primary-600 px-8 py-3 text-sm font-medium text-white hover:bg-primary-700">
              Sign Up Free
            </Link>
            <Link href="/login?demo=true" className="inline-flex items-center rounded-lg border border-border-default px-8 py-3 text-sm font-medium hover:bg-surface-alt">
              Try Demo
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
