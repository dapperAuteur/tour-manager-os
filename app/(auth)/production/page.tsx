import type { Metadata } from 'next'
import Link from 'next/link'
import { Wrench, Guitar, LayoutGrid, ListMusic, StickyNote } from 'lucide-react'

export const metadata: Metadata = { title: 'Production Bible', robots: { index: false } }

const sections = [
  { href: '/production/equipment', label: 'Equipment', description: 'Instruments, amps, cables, and gear inventory', icon: Guitar },
  { href: '/production/stage-plots', label: 'Stage Plots', description: 'Stage layouts with positioned elements', icon: LayoutGrid },
  { href: '/production/input-lists', label: 'Input Lists', description: 'Channel-by-channel patch sheets', icon: ListMusic },
  { href: '/production/venue-notes', label: 'Venue Notes', description: 'Historical notes that persist across tours', icon: StickyNote },
]

export default function ProductionPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Wrench className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          Production Bible
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Equipment, stage plots, input lists, and venue notes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-border-default bg-surface-raised p-6 transition-all hover:border-primary-500/50 hover:shadow-sm"
          >
            <s.icon className="mb-3 h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <h2 className="font-semibold">{s.label}</h2>
            <p className="mt-1 text-sm text-text-secondary">{s.description}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
