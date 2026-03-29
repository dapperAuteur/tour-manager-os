'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createInputList } from '@/lib/production/actions'

interface Channel {
  instrument: string
  microphone: string
  di: boolean
  phantom: boolean
}

export function NewInputListForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [channels, setChannels] = useState<Channel[]>([
    { instrument: '', microphone: '', di: false, phantom: false },
  ])

  function addChannel() {
    setChannels([...channels, { instrument: '', microphone: '', di: false, phantom: false }])
  }

  function removeChannel(idx: number) {
    if (channels.length <= 1) return
    setChannels(channels.filter((_, i) => i !== idx))
  }

  function updateChannel(idx: number, field: keyof Channel, value: string | boolean) {
    const updated = [...channels]
    updated[idx] = { ...updated[idx], [field]: value }
    setChannels(updated)
  }

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    // Append channel data
    channels.forEach((ch, i) => {
      formData.append(`ch_${i}_instrument`, ch.instrument)
      formData.append(`ch_${i}_microphone`, ch.microphone)
      if (ch.di) formData.append(`ch_${i}_di`, 'on')
      if (ch.phantom) formData.append(`ch_${i}_phantom`, 'on')
    })
    const result = await createInputList(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">List Name <span className="text-error-500">*</span></label>
        <input id="name" name="name" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Main input list" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_default" className="rounded accent-primary-600" />
        Set as default
      </label>

      <div>
        <p className="mb-3 text-sm font-medium">Channels</p>
        <div className="space-y-2">
          <div className="grid grid-cols-[3rem_1fr_1fr_3rem_3rem_2rem] gap-2 text-xs font-medium text-text-muted">
            <span>Ch</span>
            <span>Instrument/Source</span>
            <span>Microphone</span>
            <span>DI</span>
            <span>48V</span>
            <span></span>
          </div>
          {channels.map((ch, idx) => (
            <div key={idx} className="grid grid-cols-[3rem_1fr_1fr_3rem_3rem_2rem] items-center gap-2">
              <span className="text-center text-sm font-mono text-text-muted">{idx + 1}</span>
              <input
                type="text"
                value={ch.instrument}
                onChange={(e) => updateChannel(idx, 'instrument', e.target.value)}
                className="rounded border border-border-default bg-surface px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none dark:bg-surface-alt"
                placeholder="Kick drum"
              />
              <input
                type="text"
                value={ch.microphone}
                onChange={(e) => updateChannel(idx, 'microphone', e.target.value)}
                className="rounded border border-border-default bg-surface px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none dark:bg-surface-alt"
                placeholder="SM91"
              />
              <label className="flex items-center justify-center">
                <input type="checkbox" checked={ch.di} onChange={(e) => updateChannel(idx, 'di', e.target.checked)} className="accent-primary-600" aria-label={`DI for channel ${idx + 1}`} />
              </label>
              <label className="flex items-center justify-center">
                <input type="checkbox" checked={ch.phantom} onChange={(e) => updateChannel(idx, 'phantom', e.target.checked)} className="accent-primary-600" aria-label={`Phantom power for channel ${idx + 1}`} />
              </label>
              <button type="button" onClick={() => removeChannel(idx)} disabled={channels.length <= 1} className="text-text-muted hover:text-error-500 disabled:opacity-30" aria-label={`Remove channel ${idx + 1}`}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addChannel} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
          <Plus className="h-3 w-3" aria-hidden="true" /> Add channel
        </button>
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Input List'}</button>
    </form>
  )
}
