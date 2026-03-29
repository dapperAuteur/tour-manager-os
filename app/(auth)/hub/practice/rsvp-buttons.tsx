'use client'

import { useState } from 'react'
import { rsvpPractice } from '@/lib/hub/actions'

const statuses = [
  { value: 'going' as const, label: 'Going', activeClass: 'bg-success-500/20 text-success-600 border-success-500/50' },
  { value: 'maybe' as const, label: 'Maybe', activeClass: 'bg-warning-500/20 text-warning-600 border-warning-500/50' },
  { value: 'not_going' as const, label: "Can't Make It", activeClass: 'bg-error-500/20 text-error-500 border-error-500/50' },
]

export function RsvpButtons({ sessionId, currentStatus }: { sessionId: string; currentStatus: string | null }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleRsvp(newStatus: 'going' | 'maybe' | 'not_going') {
    setLoading(true)
    const result = await rsvpPractice(sessionId, newStatus)
    if (result.success) setStatus(newStatus)
    setLoading(false)
  }

  return (
    <div className="flex gap-2" role="group" aria-label="RSVP">
      {statuses.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => handleRsvp(s.value)}
          disabled={loading}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            status === s.value ? s.activeClass : 'border-border-default hover:bg-surface-alt'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
