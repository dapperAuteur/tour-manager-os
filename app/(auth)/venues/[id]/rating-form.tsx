'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { rateVenue } from '@/lib/venues/actions'

function StarInput({ name, label }: { name: string; label: string }) {
  const [value, setValue] = useState(0)
  const [hover, setHover] = useState(0)

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      <div className="flex gap-0.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
            aria-label={`${n} star${n !== 1 ? 's' : ''}`}
          >
            <Star className={`h-5 w-5 transition-colors ${n <= (hover || value) ? 'fill-warning-500 text-warning-500' : 'text-border-default hover:text-warning-300'}`} />
          </button>
        ))}
        <input type="hidden" name={name} value={value} />
      </div>
    </div>
  )
}

export function RatingForm({ venueId }: { venueId: string }) {
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setSaved(false)
    setLoading(true)
    const result = await rateVenue(venueId, formData)
    if (result?.error) setError(result.error)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {error && <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">{error}</div>}
      {saved && <div role="status" className="rounded-lg bg-success-500/10 p-3 text-sm text-success-600 dark:text-success-500">Rating saved!</div>}

      <StarInput name="overall_rating" label="Overall *" />

      <div className="grid grid-cols-2 gap-3">
        <StarInput name="sound_rating" label="Sound" />
        <StarInput name="hospitality_rating" label="Hospitality" />
        <StarInput name="load_in_rating" label="Load-in" />
        <StarInput name="dressing_room_rating" label="Dressing Rooms" />
      </div>

      <div>
        <label htmlFor="review" className="mb-1 block text-xs font-medium text-text-muted">Review</label>
        <textarea id="review" name="review" rows={3} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" placeholder="How was this venue?" />
      </div>

      <div>
        <label htmlFor="show_date" className="mb-1 block text-xs font-medium text-text-muted">Show Date</label>
        <input id="show_date" name="show_date" type="date" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt" />
      </div>

      <button type="submit" disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
        {loading ? 'Saving...' : 'Submit Rating'}
      </button>
    </form>
  )
}
