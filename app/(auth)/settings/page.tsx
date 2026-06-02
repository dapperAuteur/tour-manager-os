import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, ClipboardCheck, Package, Users } from 'lucide-react'
import { getUserProfile } from '@/lib/settings/queries'
import { ProfileForm } from './profile-form'
import { PreferencesForm } from './preferences-form'
import { PushNotifications } from './push-notifications'
import { GmailConnection } from './gmail-connection'
import { getGmailConnection, isGmailOauthConfigured } from '@/lib/email/gmail'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ gmail_oauth?: string }>
}) {
  const data = await getUserProfile()
  if (!data) redirect('/login')

  const { user, profile } = data
  const { gmail_oauth: gmailFlash } = await searchParams
  const gmailConn = await getGmailConnection(user.id)

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-2xl font-bold">Settings</h1>

        <div className="space-y-8">
          {/* Profile */}
          <section aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="mb-4 text-lg font-semibold">Profile</h2>
            <div className="rounded-xl border border-border-default bg-surface-raised p-6">
              <ProfileForm user={user} profile={profile} />
            </div>
          </section>

          {/* Preferences */}
          <section aria-labelledby="preferences-heading">
            <h2 id="preferences-heading" className="mb-4 text-lg font-semibold">Preferences</h2>
            <div className="rounded-xl border border-border-default bg-surface-raised p-6">
              <PreferencesForm profile={profile} />
            </div>
          </section>

          {/* Email sender — Gmail OAuth */}
          <section aria-labelledby="gmail-heading">
            <h2 id="gmail-heading" className="mb-4 text-lg font-semibold">Email sender (Gmail)</h2>
            <div className="rounded-xl border border-border-default bg-surface-raised p-6">
              <GmailConnection
                connected={!!gmailConn}
                emailAddress={gmailConn?.email_address ?? null}
                configured={isGmailOauthConfigured()}
                flash={gmailFlash ?? null}
              />
            </div>
          </section>

          {/* Push notifications */}
          <section aria-labelledby="push-heading">
            <h2 id="push-heading" className="mb-4 text-lg font-semibold">Push notifications</h2>
            <div className="rounded-xl border border-border-default bg-surface-raised p-6">
              <PushNotifications
                vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null}
              />
            </div>
          </section>

          {/* Contact groups */}
          <section aria-labelledby="contact-groups-heading">
            <h2 id="contact-groups-heading" className="mb-4 text-lg font-semibold">Contact Groups</h2>
            <Link
              href="/settings/contact-groups"
              className="flex items-start justify-between gap-3 rounded-xl border border-border-default bg-surface-raised p-6 hover:border-primary-500/40"
            >
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Manage venue contact visibility</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Group venue contacts and decide which band members can see them.
                    Contacts not in any group stay visible to everyone (current default).
                  </p>
                </div>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-text-muted" aria-hidden="true" />
            </Link>
          </section>

          {/* Merch ship-from */}
          <section aria-labelledby="ship-from-heading">
            <h2 id="ship-from-heading" className="mb-4 text-lg font-semibold">Merch Ship-From Address</h2>
            <Link
              href="/settings/ship-from"
              className="flex items-start justify-between gap-3 rounded-xl border border-border-default bg-surface-raised p-6 hover:border-primary-500/40"
            >
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 size-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Where your merch ships from</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Used by Shippo to quote real-time shipping rates at fan checkout.
                    Required to enable live rates on the public store.
                  </p>
                </div>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-text-muted" aria-hidden="true" />
            </Link>
          </section>

          {/* Rider template */}
          <section aria-labelledby="rider-template-heading">
            <h2 id="rider-template-heading" className="mb-4 text-lg font-semibold">Rider Template</h2>
            <Link
              href="/settings/rider-template"
              className="flex items-start justify-between gap-3 rounded-xl border border-border-default bg-surface-raised p-6 hover:border-primary-500/40"
            >
              <div className="flex items-start gap-3">
                <ClipboardCheck className="mt-0.5 size-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Your band&apos;s default rider</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Hospitality + technical line items that get stamped onto every show&apos;s
                    compliance checklist at load-in.
                  </p>
                </div>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-text-muted" aria-hidden="true" />
            </Link>
          </section>

          {/* Account info */}
          <section aria-labelledby="account-heading">
            <h2 id="account-heading" className="mb-4 text-lg font-semibold">Account</h2>
            <div className="rounded-xl border border-border-default bg-surface-raised p-6">
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <span className="text-text-muted">Email:</span>{' '}
                  <span className="font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="text-text-muted">Account created:</span>{' '}
                  <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
  )
}
