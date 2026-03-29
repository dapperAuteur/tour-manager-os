'use client'

import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { createOrganization } from '@/lib/modules/actions'

export function SetupOrgBanner() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createOrganization(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-8 text-center">
      <Building2 className="mx-auto mb-4 h-12 w-12 text-primary-600 dark:text-primary-400" aria-hidden="true" />
      <h2 className="mb-2 text-lg font-semibold">Set Up Your Organization</h2>
      <p className="mb-6 text-sm text-text-secondary">
        Create an organization to enable modules and invite team members.
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="mx-auto flex max-w-sm gap-3">
        <label htmlFor="org-name" className="sr-only">Organization name</label>
        <input
          id="org-name"
          name="name"
          type="text"
          required
          placeholder="e.g., The Roadwell Family"
          className="flex-1 rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  )
}
