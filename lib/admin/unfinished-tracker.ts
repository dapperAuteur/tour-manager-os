/**
 * Hardcoded tracker of every roadmap item that is either:
 *   - 📋 Planned but not yet started, or
 *   - ⚠️ Audit drift — labelled ✅ in ROADMAP.md but no implementation found
 *
 * Source of truth in markdown: `plans/02-unfinished-tracker.md`.
 * Sync this file by hand when items ship — `lastSynced` should match the
 * markdown's "Last synced with ROADMAP.md" date.
 *
 * Why hardcode instead of reading the markdown? `plans/` is gitignored
 * (operator working notes), so the page wouldn't render on Vercel. Keeping
 * the structured data here means the admin can scan in prod.
 */

export interface TrackerItem {
  /** Stable identifier for if/when we wire up check-off persistence. */
  key: string
  label: string
  /** Optional one-liner with extra context for the operator. */
  detail?: string
}

export interface TrackerSection {
  /** Phase number or null for cross-phase sections. */
  phase: number | null
  /** Short label rendered as a card heading. */
  title: string
  items: TrackerItem[]
}

export const DRIFT_ITEMS: TrackerItem[] = []

export const PLANNED_SECTIONS: TrackerSection[] = [
  {
    phase: 4,
    title: 'Phase 4 — Tour Money Tracker',
    items: [
      { key: 'p4-expense-splitting', label: 'Expense cost splitting between team members' },
    ],
  },
  {
    phase: 5,
    title: 'Phase 5 — Show Day',
    items: [
      { key: 'p5-push', label: 'Push notifications for schedule changes' },
    ],
  },
  {
    phase: 8,
    title: 'Phase 8 — Merch',
    items: [
      { key: 'p8-drops', label: 'Tour-exclusive merch drops' },
    ],
  },
  {
    phase: 9,
    title: 'Phase 9 — Fan Marketing & Community',
    items: [
      { key: 'p9-exclusive', label: 'Pre/post-show exclusive content' },
    ],
  },
  {
    phase: 10,
    title: 'Phase 10 — Family Tour Hub',
    items: [
      { key: 'p10-days-off', label: 'Days-off planner with local suggestions' },
    ],
  },
  {
    phase: 12,
    title: 'Phase 12 — Admin Dashboard',
    items: [
      { key: 'p12-engagement', label: 'User engagement metrics (DAU/WAU/MAU, session duration)' },
      { key: 'p12-adoption', label: 'Module adoption rates' },
      { key: 'p12-charts-more', label: 'Charts and graphs (Recharts bar + pie — line shipped)', detail: 'Recharts installed and a 30-day growth line is live on /admin/dashboard. Bar + pie variants for category breakdowns still TBD.' },
    ],
  },
  {
    phase: 13,
    title: 'Phase 13 — Academy / LMS',
    items: [
      { key: 'p13-cert', label: 'Certificates of completion (PDF)' },
      { key: 'p13-editor', label: 'Admin course/lesson editor' },
      { key: 'p13-video', label: 'Video lesson support' },
    ],
  },
  {
    phase: 14,
    title: 'Phase 14 — Musician Tax',
    items: [
      { key: 'p14-qb-xero', label: 'QuickBooks / Xero integration' },
    ],
  },
  {
    phase: 15,
    title: 'Phase 15 — Production Bible',
    items: [
      { key: 'p15-stage-plot', label: 'Drag-and-drop stage plot builder' },
    ],
  },
  {
    phase: 17,
    title: 'Phase 17 — Email Integration',
    items: [
      { key: 'p17-oauth', label: 'OAuth-connected email (Gmail/Outlook) for sending from user\'s own address' },
      { key: 'p17-inbox', label: 'Emails appear in user\'s regular inbox' },
    ],
  },
  {
    phase: 19,
    title: 'Phase 19 — White Label',
    items: [
      { key: 'p19-theme', label: 'Dynamic theme injection from org branding at runtime' },
      { key: 'p19-routing', label: 'Multi-tenant domain routing middleware' },
    ],
  },
  {
    phase: 20,
    title: 'Phase 20 — Venue Network',
    items: [
      { key: 'p20-photos', label: 'Venue photos' },
      { key: 'p20-map', label: 'Map view with Leaflet' },
    ],
  },
  {
    phase: 22,
    title: 'Phase 22 — Wellness',
    items: [
      { key: 'p22-burnout', label: 'Burnout detection (schedule density + energy alerts)' },
      { key: 'p22-days-off', label: 'Days-off wellness suggestions (gyms, spas, parks)' },
      { key: 'p22-wearable', label: 'Wearable integration via CentenarianOS' },
    ],
  },
  {
    phase: 24,
    title: 'Phase 24 — Ticketing',
    items: [
      { key: 'p24-connect', label: 'Stripe Connect split payments (Phase 24.1)' },
      { key: 'p24-wallet', label: 'Apple/Google Wallet .pkpass ticket delivery' },
      { key: 'p24-offline', label: 'Offline scanner cache (IndexedDB + reconciliation)' },
    ],
  },
  {
    phase: 24.5 as unknown as number,
    title: 'Phase 24.5 — Fan Photo Sharing',
    items: [
      { key: 'p245-realtime-mod', label: 'Realtime moderation queue via Supabase Realtime' },
      { key: 'p245-ai-mod', label: 'AI moderation pre-filter (image safety scan before queue)' },
    ],
  },
]

export const RECENTLY_SHIPPED: { label: string; branch: string }[] = [
  { label: 'Phase 4 — Member-to-member loan ledger + receipt image viewer', branch: 'feature/expense-reconciliation / receipt-image-viewer' },
  { label: 'Phase 8 — Online merch store with Stripe Elements + Shippo', branch: 'feature/merch-store-stripe → shippo-elements' },
  { label: 'Phase 9 — Public event pages per show', branch: 'feature/public-event-pages' },
  { label: 'Phase 15 — Crew call sheets + Rider compliance checklists', branch: 'feature/hotel-bookings (call sheet) + feature/rider-compliance' },
  { label: 'Phase 18 — Public API: finances/merch/contacts + OpenAPI spec', branch: 'feature/public-api-v1-expansion' },
  { label: 'Phase 21 — Cross-act messaging + festival lineup', branch: 'feature/cross-act-messaging + feature/festival-mode' },
]

export const LAST_SYNCED_DATE = '2026-06-01'

export const TOTAL_PLANNED = PLANNED_SECTIONS.reduce(
  (n, s) => n + s.items.length,
  0,
)
export const TOTAL_DRIFT = DRIFT_ITEMS.length
