'use client'

import { useState } from 'react'
import { updateThreadStatus } from '@/lib/feedback/actions'

const statuses = ['open', 'in_progress', 'resolved', 'closed'] as const

const statusColors: Record<string, string> = {
  open: 'bg-primary-500/20 text-primary-600',
  in_progress: 'bg-warning-500/20 text-warning-600',
  resolved: 'bg-success-500/20 text-success-600',
  closed: 'bg-text-muted/20 text-text-muted',
}

export function StatusControl({ threadId, currentStatus }: { threadId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    setStatus(newStatus)
    await updateThreadStatus(threadId, newStatus)
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status]}`}>
        {status.replace('_', ' ')}
      </span>
      <label htmlFor="status-select" className="sr-only">Change status</label>
      <select
        id="status-select"
        value={status}
        onChange={handleChange}
        className="rounded-lg border border-border-default bg-surface px-2 py-1 text-xs focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>
    </div>
  )
}
