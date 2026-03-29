'use client'

import { useState } from 'react'
import { addEquipment } from '@/lib/production/actions'

export function AddEquipmentForm({ orgId }: { orgId: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await addEquipment(orgId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">Name <span className="text-error-500">*</span></label>
        <input id="name" name="name" type="text" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Fender Stratocaster" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">Category <span className="text-error-500">*</span></label>
          <select id="category" name="category" required className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="instrument">Instrument</option>
            <option value="amplifier">Amplifier</option>
            <option value="microphone">Microphone</option>
            <option value="cable">Cable</option>
            <option value="stand">Stand</option>
            <option value="monitor">Monitor</option>
            <option value="di_box">DI Box</option>
            <option value="effects">Effects</option>
            <option value="drum">Drum</option>
            <option value="keyboard">Keyboard</option>
            <option value="case">Case</option>
            <option value="lighting">Lighting</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="condition" className="mb-1 block text-sm font-medium">Condition</label>
          <select id="condition" name="condition" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt">
            <option value="excellent">Excellent</option>
            <option value="good" selected>Good</option>
            <option value="fair">Fair</option>
            <option value="needs_repair">Needs Repair</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={2} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Sunburst finish, rosewood fretboard" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="serial_number" className="mb-1 block text-sm font-medium">Serial Number</label>
          <input id="serial_number" name="serial_number" type="text" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium">Quantity</label>
          <input id="quantity" name="quantity" type="number" min="1" defaultValue={1} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="travels_with_band" value="yes" defaultChecked className="accent-primary-600" /> Travels
          </label>
          <label className="ml-4 flex items-center gap-2 text-sm">
            <input type="radio" name="travels_with_band" value="no" className="accent-primary-600" /> Stays
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">Notes</label>
        <textarea id="notes" name="notes" rows={2} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="Any additional notes..." />
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Adding...' : 'Add Equipment'}</button>
    </form>
  )
}
