'use client'

import { useState } from 'react'
import { Globe, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { addCustomDomain, removeDomain } from '@/lib/white-label/actions'

interface Domain {
  id: string
  domain: string
  verified: boolean
  verification_token: string | null
  ssl_provisioned: boolean
}

export function DomainsSection({ orgId, domains }: { orgId: string; domains: Domain[] }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)

  async function handleAdd(formData: FormData) {
    setError('')
    setNewToken(null)
    setLoading(true)
    const result = await addCustomDomain(orgId, formData)
    if (result?.error) setError(result.error)
    if (result?.verificationToken) setNewToken(result.verificationToken)
    setLoading(false)
  }

  async function handleRemove(domainId: string) {
    if (!confirm('Remove this domain?')) return
    await removeDomain(domainId)
  }

  return (
    <div className="space-y-4">
      {domains.length === 0 && !newToken ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-6 text-center">
          <Globe className="mx-auto mb-2 h-8 w-8 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No custom domains. Add one to use your own domain.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {domains.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-border-default bg-surface-raised p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-text-muted" aria-hidden="true" />
                <div>
                  <p className="font-medium">{d.domain}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs">
                    {d.verified ? (
                      <span className="flex items-center gap-1 text-success-600 dark:text-success-500">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-warning-600 dark:text-warning-500">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" /> Pending verification
                      </span>
                    )}
                    {d.ssl_provisioned && <span className="text-success-600 dark:text-success-500">SSL active</span>}
                  </div>
                  {!d.verified && d.verification_token && (
                    <p className="mt-2 text-xs text-text-muted">
                      Add a TXT record: <code className="rounded bg-surface-alt px-1.5 py-0.5">{d.verification_token}</code>
                    </p>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => handleRemove(d.id)} className="text-text-muted hover:text-error-500" aria-label={`Remove ${d.domain}`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {newToken && (
        <div className="rounded-lg border border-warning-500/30 bg-warning-500/10 p-4">
          <p className="text-sm font-medium text-warning-600 dark:text-warning-500">Domain added — verify ownership</p>
          <p className="mt-1 text-xs text-text-secondary">
            Add a TXT record to your DNS with value: <code className="rounded bg-surface px-1.5 py-0.5 font-mono">{newToken}</code>
          </p>
        </div>
      )}

      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <form action={handleAdd} className="flex gap-3">
        <label htmlFor="domain" className="sr-only">Domain</label>
        <input id="domain" name="domain" type="text" required placeholder="app.yourbrand.com" className="flex-1 rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        <button type="submit" disabled={loading} className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
          <Plus className="h-4 w-4" aria-hidden="true" /> {loading ? 'Adding...' : 'Add Domain'}
        </button>
      </form>
    </div>
  )
}
