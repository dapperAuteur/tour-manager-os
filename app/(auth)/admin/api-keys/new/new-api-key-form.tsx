'use client'

import { useState } from 'react'
import { Copy, CheckCircle2 } from 'lucide-react'
import { createApiKey } from '@/lib/api/actions'

const availableScopes = [
  { value: 'read', label: 'Read', description: 'Read tours, shows, itineraries' },
  { value: 'write', label: 'Write', description: 'Create and update resources' },
  { value: 'finances', label: 'Finances', description: 'Access financial data' },
]

export function NewApiKeyForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await createApiKey(orgId, formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.key) {
      setGeneratedKey(result.key)
    }
    setLoading(false)
  }

  async function copyKey() {
    if (!generatedKey) return
    await navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (generatedKey) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-warning-500/30 bg-warning-500/10 p-4">
          <p className="mb-2 text-sm font-semibold text-warning-600 dark:text-warning-500">
            Copy your API key now — it will not be shown again!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded bg-surface px-3 py-2 text-xs font-mono dark:bg-surface-alt">
              {generatedKey}
            </code>
            <button
              type="button"
              onClick={copyKey}
              className="inline-flex items-center gap-1 rounded-lg border border-border-default px-3 py-2 text-xs font-medium hover:bg-surface-alt"
              aria-label="Copy API key"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <a href="/admin/api-keys" className="inline-block text-sm text-primary-600 hover:underline dark:text-primary-400">
          &larr; Back to API Keys
        </a>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">Key Name <span className="text-error-500">*</span></label>
        <input id="name" name="name" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="My Integration" />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Scopes</legend>
        <div className="space-y-2">
          {availableScopes.map((scope) => (
            <label key={scope.value} className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="scopes" value={scope.value} defaultChecked={scope.value === 'read'} className="mt-0.5 rounded accent-primary-600" />
              <div>
                <span className="font-medium">{scope.label}</span>
                <p className="text-xs text-text-muted">{scope.description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
        {loading ? 'Generating...' : 'Generate API Key'}
      </button>
    </form>
  )
}
