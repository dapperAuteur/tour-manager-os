import { Coffee } from 'lucide-react'

export function NoShowDay({ date }: { date: string }) {
  const dateObj = new Date(date + 'T12:00:00')

  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-12 text-center">
      <Coffee className="mx-auto mb-4 h-12 w-12 text-text-muted" aria-hidden="true" />
      <h2 className="mb-2 text-lg font-semibold">Day Off</h2>
      <p className="text-sm text-text-secondary">
        No show scheduled for {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
        Enjoy the rest!
      </p>
    </div>
  )
}
