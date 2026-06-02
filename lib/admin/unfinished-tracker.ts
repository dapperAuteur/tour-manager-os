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
    phase: 17,
    title: 'Phase 17 — Email Integration',
    items: [
      { key: 'p17-outlook', label: 'OAuth-connected Outlook (Gmail shipped — Outlook follows same pattern)' },
    ],
  },
  {
    phase: 22,
    title: 'Phase 22 — Wellness',
    items: [
      { key: 'p22-wearable', label: 'Wearable integration via CentenarianOS' },
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
  { label: 'Phase 13 — Admin course/lesson editor', branch: 'feature/academy-editor' },
  { label: 'Phase 13 — Video lesson support (YouTube/Vimeo/Loom/direct mp4 embed)', branch: 'feature/academy-video' },
  { label: 'Phase 19 — Runtime brand theme injection (org primary color → CSS custom properties)', branch: 'feature/white-label-theme' },
  { label: 'Phase 5 — Web push notifications (VAPID + service worker + advance-submitted trigger)', branch: 'feature/push-notifications' },
  { label: 'Phase 24 — Offline ticket scanner cache (manifest + IndexedDB queue + sync)', branch: 'feature/offline-scanner' },
  { label: 'Phase 14 — QuickBooks / Xero accounting CSV export', branch: 'feature/quickbooks-xero-export' },
  { label: 'Phase 15 — Drag-and-drop stage plot builder', branch: 'feature/stage-plot-builder' },
  { label: 'Phase 19 — Multi-tenant domain routing middleware', branch: 'feature/multi-tenant-routing' },
  { label: 'Phase 24 — Stripe Connect split payments scaffolding (account + tour revenue splits config)', branch: 'feature/stripe-connect-splits' },
  { label: 'Phase 4 — Receipt image viewing on expense detail (drift closeout)', branch: 'feature/receipt-image-viewer' },
  { label: 'Phase 24.1 — Stripe Connect Transfer execution at ticket sale (closes splits flow)', branch: 'feature/stripe-connect-execute' },
  { label: 'Phase 24 — Apple Wallet .pkpass ticket delivery', branch: 'feature/apple-wallet-pkpass' },
  { label: 'Phase 17 — OAuth Gmail send-as for campaigns (Sent folder + inbox replies)', branch: 'feature/oauth-gmail-send' },
]

export const LAST_SYNCED_DATE = '2026-06-02'

export const TOTAL_PLANNED = PLANNED_SECTIONS.reduce(
  (n, s) => n + s.items.length,
  0,
)
export const TOTAL_DRIFT = DRIFT_ITEMS.length
