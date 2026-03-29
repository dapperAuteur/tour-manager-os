'use client'

import { useState } from 'react'
import { updateProfile } from '@/lib/settings/actions'
import type { User } from '@supabase/supabase-js'

interface ProfileFormProps {
  user: User
  profile: {
    display_name: string | null
    bio: string | null
    phone: string | null
  } | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSaved(false)
    setLoading(true)
    const result = await updateProfile(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </div>
      )}
      {saved && (
        <div role="status" className="rounded-lg bg-success-500/10 p-3 text-sm text-success-600 dark:text-success-500">
          Profile saved.
        </div>
      )}

      <div>
        <label htmlFor="display_name" className="mb-1 block text-sm font-medium">Display Name</label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile?.display_name || user.user_metadata?.display_name || ''}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1 block text-sm font-medium">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profile?.bio || ''}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile?.phone || ''}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  )
}
