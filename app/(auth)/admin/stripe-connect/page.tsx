import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { getConnectedAccount } from '@/lib/stripe-connect/queries'
import { getUserOrg } from '@/lib/modules/queries'
import { OnboardButton } from './onboard-button'
import { RefreshButton } from './refresh-button'

export const metadata: Metadata = {
  title: 'Admin · Stripe Connect',
  robots: { index: false },
}

export default async function StripeConnectPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  const admin = isSuperAdmin(user.email) || !!orgMembership
  if (!admin) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-text-secondary">Admin access required.</p>
      </main>
    )
  }
  const orgId = orgMembership?.org_id
  const account = orgId ? await getConnectedAccount(orgId) : null

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Back to admin
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Stripe Connect</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Connect a Stripe Express account so ticket and merch revenue can
        be split automatically across the artist, venue, and crew per
        tour. Until onboarding completes, the platform Stripe account
        receives 100% of the payment.
      </p>

      {!orgId ? (
        <p className="rounded-md border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-700 dark:text-warning-300">
          Create an organization on{' '}
          <Link href="/modules" className="underline">
            /modules
          </Link>{' '}
          first.
        </p>
      ) : account ? (
        <section className="space-y-4 rounded-xl border border-border-default bg-surface-raised p-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted">
              Connected account
            </p>
            <p className="mt-0.5 font-mono text-xs">
              {account.stripe_account_id}
            </p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-3 text-xs">
            <li className="rounded-md border border-border-default bg-surface p-3">
              <p className="text-text-muted">Charges enabled</p>
              <p className="mt-1 flex items-center gap-1 font-semibold">
                {account.charges_enabled ? (
                  <>
                    <Check className="size-3.5 text-success-600" aria-hidden /> Yes
                  </>
                ) : (
                  <>
                    <X className="size-3.5 text-error-600" aria-hidden /> No
                  </>
                )}
              </p>
            </li>
            <li className="rounded-md border border-border-default bg-surface p-3">
              <p className="text-text-muted">Payouts enabled</p>
              <p className="mt-1 flex items-center gap-1 font-semibold">
                {account.payouts_enabled ? (
                  <>
                    <Check className="size-3.5 text-success-600" aria-hidden /> Yes
                  </>
                ) : (
                  <>
                    <X className="size-3.5 text-error-600" aria-hidden /> No
                  </>
                )}
              </p>
            </li>
            <li className="rounded-md border border-border-default bg-surface p-3">
              <p className="text-text-muted">Onboarding complete</p>
              <p className="mt-1 flex items-center gap-1 font-semibold">
                {account.onboarding_complete ? (
                  <>
                    <Check className="size-3.5 text-success-600" aria-hidden /> Yes
                  </>
                ) : (
                  <>
                    <X className="size-3.5 text-warning-600" aria-hidden /> Not yet
                  </>
                )}
              </p>
            </li>
          </ul>
          {account.last_status_refresh_at && (
            <p className="text-[10px] text-text-muted">
              Last refreshed{' '}
              {new Date(account.last_status_refresh_at).toLocaleString()}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <OnboardButton
              orgId={orgId}
              label={
                account.onboarding_complete
                  ? 'Update onboarding'
                  : 'Continue onboarding'
              }
            />
            <RefreshButton orgId={orgId} />
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-border-default bg-surface-raised p-5">
          <p className="mb-3 text-sm text-text-secondary">
            No connected account yet. Click below to start the Stripe Express
            onboarding flow. You&rsquo;ll be redirected to Stripe, then back
            here when it completes.
          </p>
          <OnboardButton orgId={orgId} label="Start onboarding" />
        </section>
      )}

      <p className="mt-4 text-xs text-text-muted">
        Per-tour split configuration is on each tour&rsquo;s finances page at
        <code className="ml-1 rounded bg-surface-alt px-1">
          /tours/&lt;id&gt;/finances/splits
        </code>
        .
      </p>
    </main>
  )
}
