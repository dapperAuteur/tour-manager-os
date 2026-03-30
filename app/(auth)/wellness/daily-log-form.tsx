'use client'

import { useState } from 'react'
import { logWellness } from '@/lib/wellness/actions'

interface WellnessLog {
  sleep_hours: number | null
  sleep_quality: number | null
  energy_level: number | null
  mood: number | null
  stress_level: number | null
  hydration_glasses: number | null
  meals_eaten: number | null
  exercised: boolean | null
  warmup_completed: boolean | null
  performance_rating: number | null
  voice_condition: number | null
  notes: string | null
}

function RatingInput({ name, label, defaultValue }: { name: string; label: string; defaultValue?: number | null }) {
  const [value, setValue] = useState(defaultValue || 0)
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setValue(n)} className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${n <= value ? 'bg-primary-600 text-white' : 'bg-surface-alt text-text-muted hover:bg-border-default'}`} aria-label={`${n}`}>{n}</button>
        ))}
        <input type="hidden" name={name} value={value} />
      </div>
    </div>
  )
}

export function DailyLogForm({ existing }: { existing: WellnessLog | null }) {
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSaved(false)
    setLoading(true)
    const result = await logWellness(formData)
    if (result?.error) setError(result.error)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}
      {saved && <div role="status" className="rounded-lg bg-success-500/10 p-3 text-sm text-success-600 dark:text-success-500">Saved!</div>}

      <input type="hidden" name="date" value={new Date().toISOString().split('T')[0]} />

      {/* Sleep */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sleep_hours" className="mb-1 block text-sm font-medium">Sleep (hours)</label>
          <input id="sleep_hours" name="sleep_hours" type="number" step="0.5" min="0" max="24" defaultValue={existing?.sleep_hours || ''} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <RatingInput name="sleep_quality" label="Sleep Quality" defaultValue={existing?.sleep_quality} />
      </div>

      {/* Energy, Mood, Stress */}
      <div className="grid gap-4 sm:grid-cols-3">
        <RatingInput name="energy_level" label="Energy" defaultValue={existing?.energy_level} />
        <RatingInput name="mood" label="Mood" defaultValue={existing?.mood} />
        <RatingInput name="stress_level" label="Stress" defaultValue={existing?.stress_level} />
      </div>

      {/* Physical */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="hydration_glasses" className="mb-1 block text-sm font-medium">Water (glasses)</label>
          <input id="hydration_glasses" name="hydration_glasses" type="number" min="0" defaultValue={existing?.hydration_glasses || ''} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div>
          <label htmlFor="meals_eaten" className="mb-1 block text-sm font-medium">Meals</label>
          <input id="meals_eaten" name="meals_eaten" type="number" min="0" max="6" defaultValue={existing?.meals_eaten || ''} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
        </div>
        <div className="flex flex-col gap-2 pt-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="exercised" defaultChecked={existing?.exercised || false} className="rounded accent-primary-600" /> Exercised</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="warmup_completed" defaultChecked={existing?.warmup_completed || false} className="rounded accent-primary-600" /> Warmup done</label>
        </div>
      </div>

      {/* Performance */}
      <div className="grid gap-4 sm:grid-cols-2">
        <RatingInput name="performance_rating" label="Performance Rating" defaultValue={existing?.performance_rating} />
        <RatingInput name="voice_condition" label="Voice Condition" defaultValue={existing?.voice_condition} />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">Notes</label>
        <textarea id="notes" name="notes" rows={2} defaultValue={existing?.notes || ''} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="How are you feeling today?" />
      </div>

      <button type="submit" disabled={loading} className="self-start rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save Log'}</button>
    </form>
  )
}
