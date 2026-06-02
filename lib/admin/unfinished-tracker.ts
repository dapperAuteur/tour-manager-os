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
    phase: 5,
    title: 'Phase 5 — Show Day',
    items: [
      { key: 'p5-push', label: 'Push notifications for schedule changes' },
    ],
  },
  {
    phase: 13,
    title: 'Phase 13 — Academy / LMS',
    items: [
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
    phase: 22,
    title: 'Phase 22 — Wellness',
    items: [
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
]

export const RECENTLY_SHIPPED: { label: string; branch: string }[] = [
  { label: 'Phase 3 — Per-module tutorials', branch: 'feature/module-tutorials' },
  { label: 'Phase 4 — Member-to-member loan ledger + receipt image viewer', branch: 'feature/expense-reconciliation / receipt-image-viewer' },
  { label: 'Phase 7 — Ecosystem footer on every public page', branch: 'feature/public-nav-coverage' },
  { label: 'Phase 8 — Online merch store with Stripe Elements + Shippo', branch: 'feature/merch-store-stripe → shippo-elements' },
  { label: 'Phase 9 — Public event pages per show', branch: 'feature/public-event-pages' },
  { label: 'Phase 10 — Days-off planner + local suggestions', branch: 'feature/days-off-planner' },
  { label: 'Phase 15 — Crew call sheets + Rider compliance checklists', branch: 'feature/hotel-bookings (call sheet) + feature/rider-compliance' },
  { label: 'Phase 16 — CSV import wizard', branch: 'feature/csv-import-wizard' },
  { label: 'Phase 18 — Public API: finances/merch/contacts + OpenAPI spec', branch: 'feature/public-api-v1-expansion' },
  { label: 'Phase 20 — Multiple contacts per venue', branch: 'feature/venue-contacts-ui' },
  { label: 'Phase 21 — Cross-act messaging + festival lineup', branch: 'feature/cross-act-messaging + feature/festival-mode' },
  { label: 'Phase 22 — Days-off wellness suggestions (folded into planner)', branch: 'feature/days-off-planner' },
  { label: 'Phase 22 — Burnout detection (/wellness/burnout)', branch: 'feature/burnout-detection' },
  { label: 'Phase 4 — Expense cost splitting + settle tracking', branch: 'feature/expense-splits' },
  { label: 'Phase 8 — Tour-exclusive merch drops', branch: 'feature/merch-drops' },
  { label: 'Phase 24.5 — Realtime moderation queue (Supabase Realtime)', branch: 'feature/realtime-moderation' },
  { label: 'Phase 9 — Pre/post-show exclusive content for subscribers', branch: 'feature/exclusive-content' },
  { label: 'Phase 13 — Academy completion certificates (PDF)', branch: 'feature/academy-certificates' },
  { label: 'Phase 24.5 — AI moderation pre-filter (vision-model NSFW/violence/off-topic)', branch: 'feature/ai-photo-moderation' },
]

export const LAST_SYNCED_DATE = '2026-06-01'

export const TOTAL_PLANNED = PLANNED_SECTIONS.reduce(
  (n, s) => n + s.items.length,
  0,
)
export const TOTAL_DRIFT = DRIFT_ITEMS.length
