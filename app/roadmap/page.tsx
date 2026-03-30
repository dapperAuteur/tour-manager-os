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
    status: 'complete',
    description: 'Product catalog, inventory tracking, per-show sales, merch P&L.',
    items: [
      { label: 'Product catalog with SKUs and categories', done: true },
      { label: 'Inventory tracking per tour', done: true },
      { label: 'Per-show sales recording', done: true },
      { label: 'Merch P&L dashboard', done: true },
      { label: 'Online store (Stripe)', done: false },
    ],
  },
  {
    name: 'Phase 9: Fan Marketing & Community',
    status: 'complete',
    description: 'Email list management, campaign builder, community discussion boards.',
    items: [
      { label: 'Email list management', done: true },
      { label: 'Campaign builder with scheduling', done: true },
      { label: 'Community categories and posts', done: true },
      { label: 'Threaded replies', done: true },
      { label: 'Email sending (Resend)', done: false },
    ],
  },
  {
    name: 'Phase 10: Family Tour Hub',
    status: 'complete',
    description: 'Polls with voting, practice scheduling with RSVP, shared photo albums.',
    items: [
      { label: 'Polls with multi-option voting', done: true },
      { label: 'Practice scheduling with RSVP', done: true },
      { label: 'Shared albums', done: true },
      { label: 'Days-off planner', done: false },
    ],
  },
  {
    name: 'Phase 11: Help & Feedback',
    status: 'complete',
    description: 'Help center with searchable articles, conversational feedback with admin.',
    items: [
      { label: 'Help center with fuzzy search', done: true },
      { label: 'Feedback threads with admin replies', done: true },
      { label: 'Admin feedback management', done: true },
      { label: 'AI-powered help (Gemini)', done: false },
    ],
  },
  {
    name: 'Phase 12: Admin Dashboard',
    status: 'complete',
    description: 'Platform analytics, user management, and activity logs.',
    items: [
      { label: 'Dashboard with platform stats', done: true },
      { label: 'User management table', done: true },
      { label: 'Activity logs', done: true },
      { label: 'Charts and graphs', done: false },
    ],
  },
  {
    name: 'Phase 13: Academy / LMS',
    status: 'complete',
    description: 'Courses, lessons, quizzes, and progress tracking.',
    items: [
      { label: 'Course catalog', done: true },
      { label: 'Lesson viewer with progress', done: true },
      { label: 'Quiz system with scoring', done: true },
      { label: '3 courses seeded (8 lessons)', done: true },
      { label: 'Certificates (PDF)', done: false },
    ],
  },
  {
    name: 'Phase 14: Musician Tax Platform',
    status: 'complete',
    description: 'State-by-state income tracking, deductions with IRS guidance, and tax export.',
    items: [
      { label: 'Tax Center dashboard', done: true },
      { label: 'State-by-state income with progress bars', done: true },
      { label: 'Deduction categories with IRS guidance', done: true },
      { label: 'CSV tax export', done: true },
      { label: 'QuickBooks/Xero integration', done: false },
    ],
  },
  {
    name: 'Phase 15: Production Bible',
    status: 'complete',
    description: 'Equipment inventory, stage plots, input lists, and venue notes.',
    items: [
      { label: 'Equipment inventory (14 categories)', done: true },
      { label: 'Stage plots', done: true },
      { label: 'Input lists / patch sheets', done: true },
      { label: 'Searchable venue notes', done: true },
      { label: 'Drag-and-drop stage plot editor', done: false },
    ],
  },
  {
    name: 'Phase 16: Subscriptions, CSV, & Email Docs',
    status: 'complete',
    description: 'Billing, CSV templates, and email setup documentation.',
    items: [
      { label: 'Subscription system (lifetime + annual)', done: true },
      { label: 'Pricing page with lifetime counter', done: true },
      { label: 'Admin promo code management', done: true },
      { label: 'CSV templates (7 data types)', done: true },
      { label: 'Email setup docs (Help + Academy)', done: true },
      { label: 'Stripe Checkout integration', done: false },
    ],
  },
  {
    name: 'Phase 17: Email Integration',
    status: 'complete',
    description: 'Send marketing emails with open/click tracking via Resend.',
    items: [
      { label: 'Resend email delivery', done: true },
      { label: 'Open tracking (pixel)', done: true },
      { label: 'Click tracking', done: true },
      { label: 'Campaign analytics', done: true },
      { label: 'Webhook handler (bounces/complaints)', done: true },
      { label: 'OAuth email (Gmail/Outlook)', done: false },
    ],
  },
  {
    name: 'Phase 18: Public API',
    status: 'complete',
    description: 'RESTful API with key management, docs, and request logging.',
    items: [
      { label: 'API key system (hashed, scoped)', done: true },
      { label: 'Endpoints: tours, shows, itineraries', done: true },
      { label: 'Developer docs page', done: true },
      { label: 'Request logging', done: true },
      { label: 'Rate limiting enforcement', done: false },
    ],
  },
  {
    name: 'Phase 19: White Label',
    status: 'complete',
    description: 'Custom branding, colors, fonts, domains for enterprise clients.',
    items: [
      { label: 'Branding settings (logo, color, font, CSS)', done: true },
      { label: 'Custom domain management', done: true },
      { label: 'DNS verification flow', done: true },
      { label: 'Dynamic theme injection', done: false },
    ],
  },
  {
    name: 'Phase 20: Venue Network',
    status: 'complete',
    description: 'Crowd-sourced venue database with ratings, reviews, and fuzzy search.',
    items: [
      { label: 'Venue directory with fuzzy search', done: true },
      { label: 'Star ratings (5 categories)', done: true },
      { label: 'Auto-create from advance sheets', done: true },
      { label: 'Venue notes integration', done: true },
      { label: 'Smart advance pre-fill', done: false },
    ],
  },
  {
    name: 'Phase 21: Multi-Act Touring',
    status: 'complete',
    description: 'Tour packages, act management, and shared production timelines.',
    items: [
      { label: 'Tour packages (tour/festival/residency)', done: true },
      { label: 'Act management with contacts', done: true },
      { label: 'Shared production timeline', done: true },
      { label: 'Timeline blocks per act', done: true },
      { label: 'Cross-act messaging', done: false },
    ],
  },
  {
    name: 'Phase 22: Wellness Platform',
    status: 'future',
    description: 'Health and wellbeing tools with CentenarianOS integration and Rise Wellness resources.',
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
