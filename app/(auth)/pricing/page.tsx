import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription, getLifetimeSalesStats } from '@/lib/subscriptions/queries'
import { CheckCircle2, Star, Zap } from 'lucide-react'

export const metadata: Metadata = { title: 'Pricing', robots: { index: false } }

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const subscription = await getUserSubscription(user.id)
  const stats = await getLifetimeSalesStats()
  const isPaid = !!subscription

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Pricing</h1>
        <p className="mt-1 text-sm text-text-secondary">One price. All features. No surprises.</p>
      </div>

      {isPaid && (
        <div className="mb-8 rounded-xl border border-success-500/30 bg-success-500/10 p-4 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success-600 dark:text-success-500" aria-hidden="true" />
          <p className="font-semibold text-success-600 dark:text-success-500">
            You have an active {subscription.type} membership
          </p>
          <p className="text-sm text-text-secondary">
            {subscription.type === 'lifetime' ? 'Lifetime access — never expires.' : `Renews ${subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'annually'}.`}
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Lifetime */}
        <div className={`rounded-xl border-2 p-6 ${stats.lifetime_remaining > 0 ? 'border-primary-500 bg-primary-500/5' : 'border-border-default opacity-75'}`}>
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <h2 className="text-lg font-bold">Lifetime</h2>
          </div>
          <div className="mb-1">
            <span className="text-3xl font-bold">$103.29</span>
            <span className="text-text-muted"> one-time</span>
          </div>
          <p className="mb-4 text-sm text-text-secondary">Pay once, access forever. Never pay again.</p>
          <p className="mb-6 text-xs font-medium text-primary-600 dark:text-primary-400">
            {stats.lifetime_remaining > 0
              ? `${stats.lifetime_remaining} of 100 spots remaining`
              : 'All 100 lifetime spots are taken!'
            }
          </p>
          <ul className="mb-6 space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> All modules included</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> Full CRUD access</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> CSV import/export</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> Priority support</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> Never expires</li>
          </ul>
          {!isPaid && stats.lifetime_remaining > 0 && (
            <a
              href={`/api/stripe/checkout?type=lifetime`}
              className="block rounded-lg bg-primary-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-primary-700"
            >
              Get Lifetime Access
            </a>
          )}
        </div>

        {/* Annual */}
        <div className={`rounded-xl border-2 p-6 ${stats.annual_unlocked ? 'border-border-default' : 'border-border-default opacity-50'}`}>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning-600 dark:text-warning-500" aria-hidden="true" />
            <h2 className="text-lg font-bold">Annual</h2>
          </div>
          <div className="mb-1">
            <span className="text-3xl font-bold">$103.29</span>
            <span className="text-text-muted"> /year</span>
          </div>
          <p className="mb-4 text-sm text-text-secondary">Renews annually. Cancel anytime.</p>
          {!stats.annual_unlocked && (
            <p className="mb-6 text-xs text-text-muted">
              Available after 100 lifetime memberships are sold ({stats.paid_lifetime_count}/100).
            </p>
          )}
          <ul className="mb-6 space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> All modules included</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> Full CRUD access</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> CSV import/export</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> Priority support</li>
          </ul>
          {!isPaid && stats.annual_unlocked && (
            <a
              href={`/api/stripe/checkout?type=annual`}
              className="block rounded-lg border border-border-default px-4 py-3 text-center text-sm font-medium hover:bg-surface-alt"
            >
              Subscribe Annually
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
