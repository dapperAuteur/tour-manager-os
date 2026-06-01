import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Users } from 'lucide-react'
import { getUserProfile } from '@/lib/settings/queries'
import { ProfileForm } from './profile-form'
import { PreferencesForm } from './preferences-form'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const data = await getUserProfile()
  if (!data) redirect('/login')

  const { user, profile } = data

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
