import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Construction, ClipboardList, Lightbulb } from 'lucide-react'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'See what we\'re building — current status and upcoming features for Tour Manager OS.',
  openGraph: {
    title: 'Roadmap — Tour Manager OS',
    description: 'See what we\'re building — current status and upcoming features.',
  },
}

interface Phase {
  name: string
  status: 'complete' | 'in-progress' | 'planned' | 'future'
  description: string
  items: { label: string; done: boolean }[]
}

const phases: Phase[] = [
  {
    name: 'Phase 1: Digital Advance Sheet + Itinerary',
    status: 'complete',
    description: 'Replace Excel advance sheets with smart web forms that auto-generate itineraries.',
    items: [
      { label: 'Tour CRUD', done: true },
      { label: 'Show management', done: true },
      { label: 'Public advance sheet form', done: true },
      { label: 'Auto-generated daily itinerary', done: true },
      { label: 'Print-friendly layout', done: true },
    ],
  },
  {
    name: 'Phase 2: User Settings & Foundation',
    status: 'complete',
    description: 'Authentication, personalization, and core app infrastructure.',
    items: [
      { label: 'Email/password + OTP login', done: true },
      { label: 'User profile & preferences', done: true },
      { label: 'Light/dark mode', done: true },
      { label: 'SEO & social media optimization', done: true },
      { label: 'Vercel Analytics', done: true },
    ],
  },
  {
    name: 'Phase 3: Module System',
    status: 'complete',
    description: 'Toggle features on/off per organization. Members opt in to modules.',
    items: [
      { label: 'Module registry (11 modules)', done: true },
      { label: 'Org-level module toggle', done: true },
      { label: 'Member opt-in / request access', done: true },
      { label: 'Per-module tutorials', done: false },
    ],
  },
  {
    name: 'Phase 4: Tour Finances',
    status: 'complete',
    description: 'Real-time P&L per show and tour with per-member financial views.',
    items: [
      { label: 'Expense tracking (10 categories)', done: true },
      { label: 'Tour P&L dashboard', done: true },
      { label: 'Per-member finance view', done: true },
      { label: 'CSV export', done: true },
      { label: 'AI receipt scanning', done: false },
    ],
  },
  {
    name: 'Phase 5: Show Day App',
    status: 'complete',
    description: 'Mobile-first daily companion for every band member.',
    items: [
      { label: 'Daily view with schedule timeline', done: true },
      { label: 'Tap-to-navigate and tap-to-call', done: true },
      { label: 'Day navigation', done: true },
      { label: 'Timezone-aware times', done: true },
      { label: 'Push notifications', done: false },
    ],
  },
  {
    name: 'Phase 6: Demo System',
    status: 'complete',
    description: 'Try before you buy with realistic demo data.',
    items: [
      { label: 'Demo users (4 roles)', done: true },
      { label: 'Single-button demo login', done: true },
      { label: 'Realistic seed data', done: true },
      { label: 'Midnight data reset', done: true },
    ],
  },
  {
    name: 'Phase 7: Landing Pages',
    status: 'complete',
    description: 'Dedicated pages for each user type and feature module.',
    items: [
      { label: 'Per-user-type pages', done: true },
      { label: 'Per-module feature pages', done: true },
      { label: 'Public roadmap', done: true },
    ],
  },
  {
    name: 'Phase 8: Merch Management',
    status: 'planned',
    description: 'Inventory tracking, per-show sales, and online merch store.',
    items: [
      { label: 'Inventory management', done: false },
      { label: 'Per-show sales tracking', done: false },
      { label: 'Online store (Stripe)', done: false },
      { label: 'Tour-exclusive drops', done: false },
    ],
  },
  {
    name: 'Phase 9: Fan Marketing & Community',
    status: 'planned',
    description: 'Email campaigns, exclusive content, and community forums.',
    items: [
      { label: 'Email list management', done: false },
      { label: 'Campaign builder', done: false },
      { label: 'Community boards', done: false },
      { label: 'Public event pages', done: false },
    ],
  },
  {
    name: 'Phase 10: Family Tour Hub',
    status: 'planned',
    description: 'Polls, practice scheduling, shared albums, and group collaboration.',
    items: [
      { label: 'Group polls', done: false },
      { label: 'Practice scheduling', done: false },
      { label: 'Shared albums', done: false },
      { label: 'Days-off planner', done: false },
    ],
  },
  {
    name: 'Phase 11+: And More',
    status: 'future',
    description: 'Help system, admin dashboard, academy, tax platform, production bible, subscriptions, public API, white label, venue network, multi-act touring, and wellness tools.',
    items: [],
  },
]

const statusConfig = {
  'complete': { icon: CheckCircle2, color: 'text-success-600 dark:text-success-500', bg: 'bg-success-500/10', label: 'Complete' },
  'in-progress': { icon: Construction, color: 'text-warning-600 dark:text-warning-500', bg: 'bg-warning-500/10', label: 'In Progress' },
  'planned': { icon: ClipboardList, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-500/10', label: 'Planned' },
  'future': { icon: Lightbulb, color: 'text-text-muted', bg: 'bg-surface-alt', label: 'Future' },
}

export default function RoadmapPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Roadmap</h1>
          <p className="mt-2 text-text-secondary">
            See what we&apos;ve built and what&apos;s coming next.
          </p>
        </div>

        <div className="space-y-6">
          {phases.map((phase) => {
            const config = statusConfig[phase.status]
            const StatusIcon = config.icon
            return (
              <div key={phase.name} className="rounded-xl border border-border-default bg-surface-raised p-6">
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="font-semibold">{phase.name}</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}>
                    <StatusIcon className="h-3 w-3" aria-hidden="true" />
                    {config.label}
                  </span>
                </div>
                <p className="mb-4 text-sm text-text-secondary">{phase.description}</p>
                {phase.items.length > 0 && (
                  <ul className="space-y-1">
                    {phase.items.map((item) => (
                      <li key={item.label} className="flex items-center gap-2 text-sm">
                        {item.done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success-600 dark:text-success-500" aria-hidden="true" />
                        ) : (
                          <div className="h-4 w-4 shrink-0 rounded-full border-2 border-border-default" aria-hidden="true" />
                        )}
                        <span className={item.done ? '' : 'text-text-muted'}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        <footer className="mt-12 border-t border-border-default py-8 text-center text-sm text-text-muted">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:text-text-secondary">Home</Link>
            <Link href="/login?demo=true" className="hover:text-text-secondary">Try Demo</Link>
            <Link href="/signup" className="hover:text-text-secondary">Sign Up</Link>
          </div>
          <p className="mt-4">Tour Manager OS</p>
        </footer>
      </main>
    </>
  )
}
