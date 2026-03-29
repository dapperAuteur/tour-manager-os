import type { Metadata } from 'next'
import Link from 'next/link'
import { Vote, CalendarCheck, ImageIcon } from 'lucide-react'

export const metadata: Metadata = { title: 'Family Hub', robots: { index: false } }

const sections = [
  { href: '/hub/polls', label: 'Polls', description: 'Group decisions and voting', icon: Vote },
  { href: '/hub/practice', label: 'Practice', description: 'Schedule rehearsals and sessions', icon: CalendarCheck },
  { href: '/hub/albums', label: 'Albums', description: 'Shared photos and videos from tours', icon: ImageIcon },
]

export default function HubPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Family Hub</h1>
      <p className="mb-8 text-sm text-text-secondary">Collaborate, decide, and share together.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-border-default bg-surface-raised p-6 text-center transition-all hover:border-primary-500/50 hover:shadow-sm"
          >
            <s.icon className="mx-auto mb-3 h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <h2 className="font-semibold">{s.label}</h2>
            <p className="mt-1 text-sm text-text-secondary">{s.description}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
