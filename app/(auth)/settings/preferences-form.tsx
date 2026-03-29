'use client'

import { useState } from 'react'
import { updatePreferences } from '@/lib/settings/actions'

interface PreferencesFormProps {
  profile: {
    timezone: string | null
    theme: string | null
    home_page: string | null
    email_notifications: boolean | null
    push_notifications: boolean | null
  } | null
}

const timezones = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'Europe/London', label: 'GMT / London' },
  { value: 'Europe/Paris', label: 'CET / Paris' },
  { value: 'Europe/Berlin', label: 'CET / Berlin' },
  { value: 'Asia/Tokyo', label: 'JST / Tokyo' },
  { value: 'Australia/Sydney', label: 'AEST / Sydney' },
]

export function PreferencesForm({ profile }: PreferencesFormProps) {
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSaved(false)
    setLoading(true)
    const result = await updatePreferences(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </div>
      )}
      {saved && (
        <div role="status" className="rounded-lg bg-success-500/10 p-3 text-sm text-success-600 dark:text-success-500">
          Preferences saved.
        </div>
      )}

      <div>
        <label htmlFor="timezone" className="mb-1 block text-sm font-medium">Timezone</label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={profile?.timezone || 'America/New_York'}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-text-muted">All dates and times will display in this timezone.</p>
      </div>

      <div>
        <label htmlFor="theme" className="mb-1 block text-sm font-medium">Theme</label>
        <select
          id="theme"
          name="theme"
          defaultValue={profile?.theme || 'system'}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        >
          <option value="system">System preference</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label htmlFor="home_page" className="mb-1 block text-sm font-medium">Home Page</label>
        <select
          id="home_page"
          name="home_page"
          defaultValue={profile?.home_page || '/dashboard'}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        >
          <option value="/dashboard">Dashboard</option>
          <option value="/today">Today (Show Day View)</option>
        </select>
        <p className="mt-1 text-xs text-text-muted">Page shown when you log in.</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Notifications</legend>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="email_notifications"
              defaultChecked={profile?.email_notifications !== false}
              className="rounded accent-primary-600"
            />
            Email notifications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="push_notifications"
              defaultChecked={profile?.push_notifications !== false}
              className="rounded accent-primary-600"
            />
            Push notifications
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  )
}
