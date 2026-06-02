import type { Metadata } from 'next'
import { CheckCircle2, Construction, ClipboardList, Lightbulb } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'

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
      { label: 'Per-module tutorials (3-5 step walkthrough on first access)', done: true },
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
      { label: 'AI receipt scanning (vision-model expense pre-fill)', done: true },
      { label: 'Receipt image viewing on expense detail (lightbox + PDF fallback + table icon)', done: true },
      { label: 'Expense cost splitting between team members (even or custom shares, settle tracking)', done: true },
      { label: 'One-page tour settlement PDF (revenue, expenses, net, splits, Stripe transfers)', done: true },
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
      { label: 'Weather forecast (Open-Meteo, cached)', done: true },
      { label: 'Push notifications (web push via VAPID + service worker + advance-sheet trigger)', done: true },
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
      { label: 'Online store (Stripe Elements + Shippo)', done: true },
      { label: 'Tour-exclusive merch drops (badge + auto-hide window)', done: true },
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
      { label: 'Pin / lock post moderation', done: true },
      { label: 'Email sending (Mailgun)', done: true },
      { label: 'Pre/post-show exclusive content for subscribers (email-gated unlock window)', done: true },
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
      { label: 'Days-off planner (derived off-days, group/personal plans, Google Maps suggestion links)', done: true },
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
      { label: 'AI-powered help (pgvector + Vercel AI Gateway + LangSmith)', done: true },
      { label: 'Conversational help agent (RAG, streaming, cited sources)', done: true },
      { label: 'Admin AI management page (hot-swap models, health checks, usage logs)', done: true },
      { label: 'Feedback mirrored to the WitUS Inbox + Triage (central cross-product triage)', done: true },
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
      { label: 'Unfinished phase tracker (audit drift + planned items)', done: true },
      { label: 'Growth chart on admin dashboard (Recharts line)', done: true },
      { label: 'Bar + pie chart variants for category breakdowns', done: true },
      { label: 'User engagement metrics (DAU/WAU/MAU + stickiness + 30-day DAU trend)', done: true },
      { label: 'Module adoption rates (per-module bar: org % + active members)', done: true },
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
      { label: '4 courses seeded (13 lessons, including admin education for stakeholder presentations)', done: true },
      { label: 'Certificates of completion (PDF, pdf-lib, verification ID footer)', done: true },
      { label: 'Admin course/lesson editor (CRUD + lesson body, video URL, draft toggle)', done: true },
      { label: 'Video lesson support (YouTube / Vimeo / Loom / direct mp4 embed)', done: true },
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
      { label: 'QuickBooks / Xero export (bank-feed CSV, category + account-code mapping)', done: true },
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
      { label: 'Drag-and-drop stage plot editor (9-piece palette + percent-of-stage coords)', done: true },
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
      { label: 'CSV import wizard with column mapping + validation', done: true },
      { label: 'Email setup docs (Help + Academy)', done: true },
      { label: 'Stripe Checkout integration', done: true },
    ],
  },
  {
    name: 'Phase 17: Email Integration',
    status: 'complete',
    description: 'Send marketing emails with open/click tracking via Mailgun.',
    items: [
      { label: 'Mailgun email delivery', done: true },
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
      { label: 'Rate limiting enforcement (per-key, per-hour)', done: true },
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
      { label: 'Dynamic theme injection at runtime (org color → derived 50–900 palette → CSS custom properties)', done: true },
      { label: 'Multi-tenant domain routing middleware (custom domain → storefront rewrite + tenant headers)', done: true },
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
      { label: 'Multiple contacts per venue (booker, sound, hospitality, etc.)', done: true },
      { label: 'Smart advance pre-fill', done: true },
      { label: 'Venue photos (Cloudinary upload + lightbox)', done: true },
      { label: 'Map view with Leaflet (OpenStreetMap tiles, click-to-open profile)', done: true },
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
    status: 'complete',
    description: 'Daily wellness tracking, warmup routines, family check-ins, and CentenarianOS integration.',
    items: [
      { label: 'Daily wellness log (12 metrics)', done: true },
      { label: 'Warmup routines (vocal, physical, breathing)', done: true },
      { label: 'Family check-ins with mood tracking', done: true },
      { label: 'Rise Wellness mental health card', done: true },
      { label: 'CentenarianOS exercise library links', done: true },
      { label: 'Burnout detection (14-day weighted score across sleep/energy/mood/stress/voice + schedule density)', done: true },
    ],
  },
  {
    name: 'Phase 24: Ticketing System',
    status: 'complete',
    description: 'Sell tickets via Stripe, scan QR codes at the door, audit every entry. Anti-counterfeit signed QRs.',
    items: [
      { label: 'Public buy page with type picker + guest checkout', done: true },
      { label: 'Stripe Checkout sessions with inventory check', done: true },
      { label: 'HMAC-signed QR codes (anti-counterfeit)', done: true },
      { label: 'Email delivery of ticket links (Mailgun)', done: true },
      { label: 'Holder ticket page with QR display', done: true },
      { label: 'Web-based door scanner (camera + manual fallback)', done: true },
      { label: 'Atomic single-use enforcement + scan log', done: true },
      { label: 'Manager dashboard (sales, scans, revenue, refunds)', done: true },
      { label: 'Refund handling via Stripe webhook', done: true },
      { label: 'Stripe Connect split payments (Express onboarding + per-tour basis-point splits + post-sale Transfer fan-out)', done: true },
      { label: 'Apple Wallet .pkpass ticket delivery (eventTicket pass + Add to Apple Wallet button)', done: true },
      { label: 'Offline scanner cache + reconciliation (IndexedDB manifest + queue, auto-sync on reconnect)', done: true },
    ],
  },
  {
    name: 'Phase 24.5: Fan Photo Sharing',
    status: 'complete',
    description: 'Ticket-holders share show photos to a pre-moderated public wall. Each photo gets its own sharable link.',
    items: [
      { label: 'Ticket-holder eligibility check (DB function + RLS)', done: true },
      { label: 'Server-signed Cloudinary uploads (10MB max)', done: true },
      { label: 'Per-show public photo wall', done: true },
      { label: 'Ticket-holder-gated uploader with caption', done: true },
      { label: 'Pre-moderation queue for tour staff', done: true },
      { label: 'Approve / reject (with reason) / remove flows', done: true },
      { label: 'Rejection email to poster via Mailgun', done: true },
      { label: 'Fan dashboard with status badges + rejection reasons', done: true },
      { label: 'Per-photo share page with OG + Twitter Card metadata', done: true },
      { label: 'Cloudinary destroy on reject / remove (no hot-linking)', done: true },
      { label: 'Realtime moderation queue (Supabase Realtime + live new-photo badge)', done: true },
      { label: 'Post-publish abuse reports UI', done: true },
      { label: 'AI-moderation pre-filter (vision-model NSFW/violence/off-topic verdict, auto-reject on high confidence)', done: true },
    ],
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

      </main>
      <SiteFooter />
    </>
  )
}
