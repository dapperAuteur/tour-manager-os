'use client'

import { useState } from 'react'
import { updateBranding } from '@/lib/white-label/actions'

interface Org {
  brand_name: string | null
  brand_tagline: string | null
  brand_logo_url: string | null
  brand_favicon_url: string | null
  brand_primary_color: string | null
  brand_font: string | null
  custom_css: string | null
  white_label_enabled: boolean | null
}

export function BrandingForm({ orgId, org }: { orgId: string; org: Org }) {
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSaved(false)
    setLoading(true)
    const result = await updateBranding(orgId, formData)
    if (result?.error) setError(result.error)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}
      {saved && <div role="status" className="rounded-lg bg-success-500/10 p-3 text-sm text-success-600 dark:text-success-500">Branding saved.</div>}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="white_label_enabled" defaultChecked={org.white_label_enabled || false} className="rounded accent-primary-600" />
        Enable white label branding
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="brand_name" className="mb-1 block text-sm font-medium">Brand Name</label>
          <input id="brand_name" name="brand_name" type="text" defaultValue={org.brand_name || ''} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Your Brand" />
        </div>
        <div>
          <label htmlFor="brand_tagline" className="mb-1 block text-sm font-medium">Tagline</label>
          <input id="brand_tagline" name="brand_tagline" type="text" defaultValue={org.brand_tagline || ''} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Your tagline here" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="brand_logo_url" className="mb-1 block text-sm font-medium">Logo URL</label>
          <input id="brand_logo_url" name="brand_logo_url" type="url" defaultValue={org.brand_logo_url || ''} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="https://..." />
        </div>
        <div>
          <label htmlFor="brand_favicon_url" className="mb-1 block text-sm font-medium">Favicon URL</label>
          <input id="brand_favicon_url" name="brand_favicon_url" type="url" defaultValue={org.brand_favicon_url || ''} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="https://..." />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="brand_primary_color" className="mb-1 block text-sm font-medium">Primary Color</label>
          <div className="flex items-center gap-2">
            <input id="brand_primary_color" name="brand_primary_color" type="color" defaultValue={org.brand_primary_color || '#4553ea'} className="h-10 w-14 cursor-pointer rounded border border-border-default" />
            <span className="text-sm text-text-muted">{org.brand_primary_color || '#4553ea'}</span>
          </div>
        </div>
        <div>
          <label htmlFor="brand_font" className="mb-1 block text-sm font-medium">Font Family</label>
          <select id="brand_font" name="brand_font" defaultValue={org.brand_font || 'Inter'} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Lato">Lato</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="custom_css" className="mb-1 block text-sm font-medium">Custom CSS (advanced)</label>
        <textarea id="custom_css" name="custom_css" rows={4} defaultValue={org.custom_css || ''} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 font-mono text-xs focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="/* Custom CSS overrides */" />
      </div>

      <button type="submit" disabled={loading} className="self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Branding'}
      </button>
    </form>
  )
}
