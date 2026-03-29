'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createPoll } from '@/lib/hub/actions'

export function NewPollForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState(['', ''])

  function addOption() {
    setOptions([...options, ''])
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== idx))
  }

  function updateOption(idx: number, value: string) {
    const newOpts = [...options]
    newOpts[idx] = value
    setOptions(newOpts)
  }

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    // Append options to formData
    options.forEach((o) => formData.append('option', o))
    const result = await createPoll(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="question" className="mb-1 block text-sm font-medium">Question <span className="text-error-500">*</span></label>
        <input id="question" name="question" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Should we add a Nashville date?" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={2} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Any context for the group..." />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Options <span className="text-error-500">*</span></p>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-2">
              <label htmlFor={`opt-${idx}`} className="sr-only">Option {idx + 1}</label>
              <input
                id={`opt-${idx}`}
                type="text"
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                className="flex-1 rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
                placeholder={`Option ${idx + 1}`}
              />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(idx)} className="rounded-lg p-2 text-text-muted hover:bg-surface-alt hover:text-error-500" aria-label={`Remove option ${idx + 1}`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
          <Plus className="h-3 w-3" aria-hidden="true" /> Add option
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="allow_multiple" className="rounded accent-primary-600" />
        Allow multiple selections
      </label>

      <div>
        <label htmlFor="closes_at" className="mb-1 block text-sm font-medium">Closes at (optional)</label>
        <input id="closes_at" name="closes_at" type="datetime-local" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Poll'}</button>
    </form>
  )
}
