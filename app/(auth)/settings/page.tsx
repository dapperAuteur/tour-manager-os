import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
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
