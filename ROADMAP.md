# Tour Manager OS — Public Roadmap

Last updated: 2026-06-01 (Phase 22 burnout detection + Phase 18 public API endpoints + OpenAPI spec + Phase 10 days-off planner + Phase 22 days-off wellness suggestions + Phase 7 ecosystem footer with Rise Wellness on all public pages + Phase 12 unfinished-tracker admin page + Phase 3 per-module tutorials + Phase 16 CSV import wizard + Phase 20 self-serve venue contacts UI + Phase 24.5 + audit quick-wins + weather + structured logging + admin-education course + AI help search + conversational agent + admin AI management + receipt OCR + WitUS Inbox feedback mirror)

## Legend
- ✅ Complete
- 🚧 In Progress
- 📋 Planned
- 💡 Future

---

## Phase 1: Digital Advance Sheet + Itinerary ✅
> Replace Excel advance sheets with smart web forms that auto-generate daily itineraries.

- ✅ Tour CRUD (create, view, list tours)
- ✅ Show management (add shows to tours, status tracking)
- ✅ Public advance sheet form (token-based, no login required)
- ✅ Advance sheet with all venue fields (venue, dressing rooms, catering, production, show details, contacts, sound)
- ✅ Show detail page (displays all advance sheet data)
- ✅ Auto-generated daily itinerary view (schedule, venue, hotel, catering, contacts, merch)
- ✅ Print-friendly itinerary layout

## Phase 2: User Settings & App Foundation ✅
> Core app infrastructure, authentication, and personalization.

- ✅ Email/password authentication
- ✅ 6-digit OTP email login
- ✅ Password policy (16 chars, mixed case, numbers, symbols, no repeats)
- ✅ User profile (display name, bio, phone)
- ✅ Preferences (timezone, theme, home page, notifications)
- ✅ Global timezone picker — 80+ IANA zones grouped by region (US & Canada / Latin America / Europe & UK / Africa & Middle East / Asia / Australia, NZ & Pacific / UTC). Shared `<TimezoneSelect>` component wired into settings, the show-creation form, and any other timezone `<select>`. Replaces the old 8-option US-centric list so international tours don&apos;t have to settle for &ldquo;closest US zone&rdquo;.
- ✅ Light/dark/system theme with flash prevention
- ✅ Responsive nav sidebar with mobile drawer
- ✅ Logout functionality
- ✅ Branded Supabase email templates (confirmation, OTP, password reset)
- ✅ SVG favicon (music note)
- ✅ SEO (Open Graph, Twitter Cards, robots.txt, sitemap.xml)
- ✅ Vercel Analytics
- ✅ Vercel deployment with Supabase integration

## Phase 3: Module System & Feature Gating ✅
> Toggle features on/off per organization. Members opt in to modules.

- ✅ Module registry (11 modules seeded: advance-sheets, itineraries, finances, show-day, merch, fan-engagement, community, documents, production, academy, wellness)
- ✅ Organization creation and management
- ✅ Organization-level module toggle (admin enables/disables with switch controls)
- ✅ Member-level opt-in / request access with approval workflow
- ✅ Nav sidebar with Modules and Admin sections
- ✅ Per-module tutorial (3-5 step walkthrough on first access) — `TutorialGate` server component on `/today`, `/me/finances`, `/merch`, `/tours/[id]`; seed steps for show-day, finances, merch, advance-sheets, ticketing in migration 042; replay button on every gated page; progress per user via `user_tutorial_progress`

## Phase 4: Tour Money Tracker ✅
> Real-time P&L per show and per tour. Per-member financial views.

- ✅ Expense tracking by category (travel, hotel, per diem, meals, equipment, crew, merch, marketing, insurance, other)
- ✅ Add expense form with show association and tax-deductible flag
- ✅ Show revenue tracking (guarantee, ticket sales, merch, other)
- ✅ Tour P&L dashboard (total revenue, total expenses, net profit, expenses by category)
- ✅ Per-member financial view (/me/finances — expenses, payouts, owed, tax deductible)
- ✅ Member-to-member loan ledger — &ldquo;drummer borrowed $5 from guitarist&rdquo; tracked separately from tour P&amp;L. Both parties see the loan; either can mark it paid (with optional method — Venmo / cash / etc.). Open balance &ldquo;net&rdquo; surfaces at the top of `/me/finances` so you know who owes whom across the tour. New `member_loans` table; RLS restricted to lender / borrower / creator
- ✅ CSV export for expenses
- ✅ Settlements and member payouts tables
- ✅ Receipt capture with AI scanning — upload via `/api/expenses/extract-receipt`; Cloudinary stores the image; vision model (default `openrouter/anthropic/claude-3.5-sonnet`, swap via `vision_model` on `/admin/ai`) extracts amount/vendor/date/category/description/tax-deductible via Zod-validated `generateObject`; user reviews + edits before saving; `receipt_url` persists on the expense row
- 📋 Receipt image viewing linked to transactions
- ✅ Expense cost splitting between team members — `/tours/[id]/finances/expenses/[expenseId]` lets you split a paid expense into per-member shares (even-split or custom amounts) and `/me/finances` surfaces &ldquo;you owe&rdquo; / &ldquo;people owe you&rdquo; with a settle-via-Venmo/Zelle/etc. dropdown. New `expense_splits` table, RLS scoped to creator + share owner

## Phase 5: Show Day App ✅
> Mobile-first daily companion for each band member.

- ✅ "Today" view — hero daily view with schedule timeline, venue, hotel, catering, sound, merch, contacts
- ✅ Day navigation (prev/next between show dates)
- ✅ Tap-to-navigate (venue/hotel addresses open in Google Maps)
- ✅ Tap-to-call (all phone numbers are clickable)
- ✅ Timezone display (abbreviation shown next to all times)
- ✅ Travel info from previous show (distance, driver)
- ✅ Next destination preview
- ✅ Day off view when no show scheduled
- 📋 Push notifications for schedule changes
- ✅ Weather integration (Open-Meteo, cached per show) — geocoding + 16-day forecast horizon, WMO-code-to-icon mapping, freshness rules (4h ≤ 14d out, 24h beyond), rendered as a `WeatherCard` near the show-day header

## Phase 6: Demo System ✅
> Pre-configured demo accounts with realistic data for try-before-you-buy.

- ✅ Demo users (Tour Manager, Band Member, Crew, Free/Read-Only)
- ✅ Single-button demo login — choose role, instant access, no signup
- ✅ Realistic seed data ("The Roadwell Family" — 2 tours, 12 shows, advance sheets, expenses, revenue, hotels, contacts)
- ✅ Demo banner with signup CTA shown on all authenticated pages
- ✅ Midnight data reset via Vercel cron job
- ✅ Full CRUD for demo users (data resets nightly)

## Phase 7: Landing Pages ✅
> Dedicated pages per user type and per module with demo login buttons.

- ✅ Main landing page — feature cards link to detail pages, user-type section, footer nav
- ✅ Per user type: /for/tour-managers, /for/musicians, /for/crew, /for/venues, /for/fans
- ✅ Per module: /features/[slug] for all 11 modules with benefits, user types, demo CTA
- ✅ Public roadmap page (/roadmap) with phase status and item checklists
- ✅ Sitemap updated with all public pages
- ✅ OG metadata on all landing pages
- ✅ Shared ecosystem-spec `SiteFooter` on every public page (homepage, `/pricing`, `/roadmap`, `/for/*`, `/features/*`, tickets, photos) — three-column nav (Ecosystem / Tour Manager OS / Partners & Legal), full Rise Wellness mental-health callout with verbatim non-affiliation disclaimer, sibling-product list, B4C LLC / AwesomeWebStore.com attribution

## Phase 8: Merch Empire ✅
> Inventory tracking, per-show sales, merch P&L.

- ✅ Product catalog (name, SKU, category, price, cost basis)
- ✅ Inventory tracking per tour (start quantity, remaining)
- ✅ Per-show merch sales recording with auto inventory update
- ✅ Merch P&L dashboard (revenue, cost, profit, units sold, top sellers)
- ✅ Demo data: 5 products, inventory, 11 sales across 3 shows
- ✅ Online merch store (Stripe Elements + Shippo live rates) at `/store/[org-slug]` — fan-facing public catalog grouped by category with per-product Buy buttons. Embedded Stripe Elements checkout at `/store/[org-slug]/checkout/[product-id]` walks the fan through Address → live Shippo rate quotes → Payment Element. Real shipping rates pulled from USPS/UPS/etc. based on product dimensions + destination. Webhook on `payment_intent.succeeded` records the order AND buys the Shippo label (PDF + tracking URL stored on the order). Falls back to legacy three-tier flat-rate hosted Stripe Checkout if Shippo isn&apos;t configured or the org hasn&apos;t set a ship-from address. New `merch_orders` + `merch_order_items` tables with order number, shipping address, Shippo references. Admin order list at `/merch/orders` shows paid → fulfilled flow with tracking-number capture. Idempotent on the Stripe session/intent id so redelivered webhooks don&apos;t double-insert. Product dimensions (weight/length/width/height) + ship-from address are self-serve via the editor + `/settings/ship-from`
- ✅ Tour-exclusive merch drops — flag a product as `is_exclusive`, pick a tour, set a visibility window (or leave blank to auto-gate by the tour's run). Storefront badges drops as &ldquo;Tour exclusive&rdquo; with an end date, and quietly hides them once the window closes

## Phase 9: Fan Marketing & Community ✅
> Email marketing and community discussion boards.

- ✅ Email list management (create lists, add subscribers manually)
- ✅ Email campaign builder (subject, content, list targeting, scheduling)
- ✅ Marketing dashboard (subscribers, lists, campaigns, sent count)
- ✅ Community categories (admin creates, members browse)
- ✅ Discussion posts with threaded replies
- ✅ Pin/lock posts (admin moderation)
- ✅ Author display names on posts and replies
- ✅ Email sending integration (Mailgun)
- ✅ CSV subscriber import
- ✅ Public event pages per show at `/shows/[id]` — fan-facing landing combining tour + venue header, doors/show/curfew times from the advance sheet, ticket-availability summary with a Buy Tickets CTA (deep-link to `/shows/[id]/tickets`), recent-fan-photo grid (deep-link to `/shows/[id]/photos`), setlist callout when one exists. Sharable URL. OG metadata for social posts. Auth show page exposes a &ldquo;Public event page&rdquo; deep link button
- ✅ Pre/post-show exclusive content — `show_exclusive_content` table holds per-show pieces with a `phase` (pre/post) and `unlock_offset_hours` relative to show-day midnight. Admin UI at `/tours/[id]/shows/[showId]/exclusive`; public event page renders a "Subscribers only" section where fans drop the email they signed up with and `/api/shows/[id]/exclusive` returns whatever pieces are inside their unlock window if the email is on any of the org&rsquo;s active subscriber lists

## Phase 10: Family Tour Hub ✅
> Polls, practice scheduling, shared albums, group collaboration.

- ✅ Family polls with multi-option voting, progress bars, open/close control
- ✅ Practice session scheduling with date/time/location and RSVP (going/maybe/can't)
- ✅ Shared photo/video albums per tour with media management
- ✅ Hub index page with Polls, Practice, Albums sections
- ✅ 404 pages (public and authenticated)
- ✅ Setlist collaboration (songs, comments, team discussion)
- ✅ Days-off planner (`/tours/[id]/days-off`) — derives off-days from tour range vs scheduled shows, per-day plans (rest/sightseeing/gym/spa/food/family/errands), group or personal, status toggle, Google Maps suggestion links

## Phase 11: Help & Feedback ✅
> Help center and conversational feedback system.

- ✅ Help center with searchable articles (7 seeded: getting started, advance sheets, finances, show day, merch, polls, accessibility)
- ✅ Article detail pages with markdown-like rendering
- ✅ Conversational feedback threads (bug/feature/question/praise)
- ✅ Threaded messages with sender names and admin badges
- ✅ Admin feedback management with status control (open → in_progress → resolved → closed)
- ✅ User-side &ldquo;Did this fix your issue?&rdquo; on every open feedback thread — reporter can confirm fixed (closes the thread + flips status to resolved) or signal still happening (re-opens for admin attention). System message posted into the thread. Admin queue surfaces a green &ldquo;User-confirmed&rdquo; or amber &ldquo;User: still happening&rdquo; badge.
- ✅ Admin sees user name on every thread with link context
- ✅ User notifications on admin replies
- ✅ Priority levels (low/normal/high/urgent)
- ✅ AI-powered help — pgvector semantic search via Mistral embeddings through the Vercel AI Gateway, LangSmith traceable, with fuzzy/ilike fallback if the embedding service is unavailable. Admin-only POST `/api/admin/help/backfill-embeddings` re-indexes after model changes
- ✅ Conversational help agent — RAG over published help articles, streaming responses via Cerebras Llama 3.3 70B by default (swap with `AI_CHAT_MODEL`), inline source citations, grounded refusal when context is missing
- ✅ Admin AI management at `/admin/ai` — super-admin-only. Hot-swap model per use case (DB override → env → default), provider key presence checks, LangSmith status, embeddings stats + backfill, on-demand provider health probes, last-20 agent activity with tokens + retrieval metadata. Dropdown-only model picker with pricing tier badges (Free / Free-tier / Pay / Gateway) + cost-per-1M tokens sourced from `lib/ai/pricing.ts`
- ✅ WitUS Inbox mirror — every user feedback/bug/question (the `/feedback/new` form, follow-up user replies, and the HelpBubble FAB) is mirrored, non-blocking, to the cross-product WitUS Inbox (`inbox.witus.online`), which auto-forwards to the WitUS Triage agent. Supabase stays the system of record; bugs ride the high-priority lane. BAM triages every WitUS product from one place. Requires `INBOX_INGEST_URL` / `INBOX_SOURCE_SLUG` / `INBOX_INGEST_SECRET`

## Phase 12: Admin Dashboard ✅
> Analytics, metrics, logs, user management.

- ✅ Admin dashboard (/admin/dashboard) — platform stats: users, orgs, tours, shows
- ✅ Financial metrics — total revenue, expenses, merch revenue across all orgs
- ✅ Feedback metrics — total threads, open/in-progress count
- ✅ User management (/admin/users) — all users with email, org, role, paid status, join date, last sign-in
- ✅ Activity logs (/admin/logs) — action, user, resource, timestamp
- ✅ Fuzzy search on help articles and feedback threads (pg_trgm)
- ✅ Reusable search bar component
- ✅ Unfinished phase tracker (/admin/unfinished) — single-page admin view of every 📋 item grouped by phase, audit-drift items at top (Recharts dashboard, smart advance pre-fill, multi-stage venues), and recently-shipped log; structured data in `lib/admin/unfinished-tracker.ts` mirrors `plans/02-unfinished-tracker.md`
- ✅ User engagement metrics — DAU / WAU / MAU + stickiness (DAU÷MAU) computed from `activity_log` over 1/7/30-day windows, surfaced as stat cards plus a 30-day DAU bar trend on `/admin/dashboard`
- ✅ Module adoption rates — per-module bar chart on `/admin/dashboard` (% of orgs with the module enabled and count of members actively opted in), sourced from `org_modules` + `member_module_access`
- ✅ Charts and graphs (Recharts) — line for growth, bar for module adoption + DAU trend, pie for user-type breakdown, all live on `/admin/dashboard`

## Phase 13: Academy / LMS ✅
> Courses teaching users how to use the platform.

- ✅ Course catalog with difficulty levels and estimated time
- ✅ Lesson viewer with markdown rendering (headings, lists, bold)
- ✅ Per-user lesson and course progress tracking
- ✅ Quiz system with multiple choice, scoring, and explanations
- ✅ Lesson navigation (prev/next within course)
- ✅ 3 seeded courses (8 lessons, 2 quizzes)
- 📋 Certificates of completion (PDF)
- 📋 Admin course/lesson editor
- 📋 Video lesson support
- ✅ Admin education tool (5-lesson course: Stripe, email, Supabase, Vercel, codebase for presentations)

## Phase 14: Musician Tax Platform ✅
> State-by-state tax tracking, deductions, year-end export.

- ✅ Tax Center dashboard (gross income, deductions, per diem, states count)
- ✅ State-by-state income tracker with progress bars
- ✅ Deduction breakdown with IRS guidance notes per category
- ✅ 15 musician-specific deduction categories seeded
- ✅ Per diem tracking table
- ✅ Year selector (5-year range)
- ✅ Income detail table
- ✅ CSV tax export (state + deduction summaries + detail records)
- 📋 QuickBooks/Xero integration
- ✅ Auto-populate state income from show revenue (DB function)

## Phase 15: Production Bible ✅
> Equipment inventory, stage plots, input lists, and venue notes.

- ✅ Equipment inventory (14 categories, condition tracking, travels/stays flag, serial numbers)
- ✅ Stage plots (name, dimensions, default flag, show association)
- ✅ Input lists / patch sheets (channel-by-channel with instrument, mic, DI, phantom power)
- ✅ Venue notes (searchable by venue name, categorized: load-in, parking, stage, sound, etc.)
- ✅ Production hub index with 4 section cards
- 📋 Drag-and-drop stage plot builder (visual editor)
- ✅ Auto-generated crew call sheets at `/tours/[id]/shows/[showId]/call-sheet` — assembles the day's brief from the advance sheet (times, venue, hospitality, dressing rooms, production notes), the tour&apos;s hotel booking for that show, and pinned + advance-sheet contacts. Print-friendly layout with `break-inside-avoid` per section; Print/PDF button on screen, hidden when printing. Deep-linked from the auth show page
- ✅ Rider compliance checklists — `org_rider_items` template per band at `/settings/rider-template` (categories: technical / hospitality / dressing room / crew / transportation / security / other). Per-show checklist at `/tours/[id]/shows/[showId]/rider`: import the template in one click, then production crew flips each line item to delivered / partial / missing / N/A at load-in with actual qty + notes. Snapshots the description at import time so historical compliance stays correct after the template evolves

## Phase 16: Subscriptions, CSV, & Email Docs ✅
> Billing, data import/export, and email setup documentation.

- ✅ Subscription system (lifetime $103.29 one-time + annual $103.29/yr after 100 lifetime sold)
- ✅ Pricing page with lifetime spots counter and annual unlock status
- ✅ Admin subscriptions dashboard (lifetime sold/remaining, annual count, total revenue)
- ✅ Promo code system (percentage/fixed discounts, max uses, expiry, lifetime grants)
- ✅ Stripe checkout API route (ready for STRIPE_SECRET_KEY config)
- ✅ CSV templates for 7 data types (shows, expenses, contacts, equipment, merch, subscribers, state income)
- ✅ Data Import/Export page with template downloads
- ✅ Email setup documentation in Help Center (Mailgun setup, DNS, API key, testing)
- ✅ Email Marketing academy course (3 lessons: building lists, campaigns, admin setup)
- ✅ Stripe Checkout session creation
- ✅ Webhook handler for Stripe events (checkout, cancellation, payment failure)
- ✅ CSV import wizard with column mapping and validation — `/data/import` with per-target flows for shows, expenses, and venue contacts; auto-matches columns by header label, previews 5 rows, runs row-by-row insert, surfaces row-level errors; `csv_imports` table logs every attempt for org-scoped history

## Phase 17: Email Integration ✅
> Send marketing emails with open/click tracking via Mailgun.

- ✅ Mailgun integration for email delivery (direct fetch client, region-aware)
- ✅ Campaign send action with batch processing (10 at a time)
- ✅ Open tracking via 1x1 pixel (auto-increments opened_count)
- ✅ Click tracking via redirect endpoint (auto-increments clicked_count)
- ✅ Unsubscribe link with confirmation page
- ✅ Campaign detail page with analytics (recipients, opens, clicks, open/click rates)
- ✅ Send button with confirmation dialog
- ✅ Mailgun webhook handler with HMAC signature verification (permanent failures + complaints auto-unsubscribe)
- ✅ HTML email template with tracking pixel and footer
- ✅ Graceful fallback when Mailgun not configured
- 📋 OAuth-connected email (Gmail/Outlook API) for sending from user's own address
- 📋 Emails appear in user's regular inbox

## Phase 18: Public API ✅
> RESTful API for third-party integrations.

- ✅ API key system (SHA-256 hashed, prefix display, scopes, rate limits)
- ✅ Key management page (/admin/api-keys) — create, view, revoke
- ✅ One-time key display with copy button (never shown again)
- ✅ API endpoints: GET /api/v1/tours, GET /api/v1/shows, GET /api/v1/itineraries
- ✅ Request logging (method, path, status, response time, IP)
- ✅ Developer docs page (/developers) — getting started, auth, endpoints, errors
- ✅ Free tier for testing, paid subscription for production use
- ✅ Webhook table ready (org-scoped, event filtering, secret hash)
- ✅ Additional endpoints — `GET /api/v1/finances/expenses` (tour_id + status filter + pagination), `GET /api/v1/merch/products` (active + category filter), `GET /api/v1/venues/contacts` (venue_id + role filter). All gated by the `read` scope and counted against the org&apos;s rate limit
- ✅ Rate limiting enforcement — per-key per-hour count against `api_logs` via `requireApiKey`; 429 response includes `X-RateLimit-*` + `Retry-After` headers
- ✅ OpenAPI/Swagger spec at `GET /api/v1/openapi` — hand-curated 3.1 spec with bearerAuth + Tour/Show/Expense/MerchProduct/VenueContact schemas. Public route so Swagger UI / ReDoc / Postman can import it directly. 5-minute browser cache + 10-minute CDN cache

## Phase 19: White Label ✅
> Branded versions for other bands/organizations.

- ✅ Branding settings: name, tagline, logo, favicon, primary color, font family, custom CSS
- ✅ White label enable/disable toggle
- ✅ Custom domain management with DNS verification (TXT record)
- ✅ SSL provisioning tracking
- ✅ Font selection (Inter, Poppins, Roboto, Open Sans, Montserrat, Lato)
- ✅ Color picker for primary brand color
- ✅ Enterprise subscription required
- 📋 Dynamic theme injection from org branding at runtime
- 📋 Multi-tenant domain routing middleware

## Phase 20: Venue Network ✅
> Crowd-sourced venue database built from advance sheets.

- ✅ Venue directory with fuzzy search (pg_trgm) and type filtering
- ✅ Venue profiles: address, phone, capacity, stage dimensions, PA, parking, dressing rooms
- ✅ Multiple contacts per venue (booker, production, hospitality, sound, etc.) with primary-per-role flag — self-serve CRUD on `/venues/[id]`
- ✅ Global contacts search at `/contacts` — search by name / phone / email / role across every venue you can see, deep-link back to the venue profile
- ✅ Contact career-history on each venue contact card — &ldquo;Also at: Venue X, Venue Y&rdquo; line matches the same person (case-insensitive email or last-7-of-phone) across other venues, so you can spot when a booker moves jobs without maintaining a `people` registry
- ✅ Contact verified flag — band members tap the ShieldCheck button on a contact to mark &ldquo;I called this number, it works.&rdquo; Records `verified_at` + `verified_by`. Green Verified badge surfaces on the card; tap again to clear. Builds trust for contacts auto-imported from advance sheets that nobody&apos;s actually used yet.
- ✅ Contact tags + visibility groups — every contact takes free-form tags (&ldquo;handles VIP comps&rdquo;, &ldquo;load-in lead&rdquo;) rendered as inline chips. Team account managers create `contact_groups` at `/settings/contact-groups`, add contacts to them, and grant per-user visibility. Contacts NOT in any group remain visible to everyone (default). Contacts in a group are visible only to org owners/admins, the group creator, and explicit visibility members. Enforced via `user_can_see_contact()` SECURITY DEFINER + a `filter_visible_contacts()` batch RPC.
- ✅ Per-show contact overrides — on a show page, pin specific `venue_contacts` (optionally with a role override + free-form note like &ldquo;filling in for Jane&rdquo;) that take precedence over the venue&apos;s default contact list for that show only. Schema: `show_contacts(show_id, contact_id, role_override, note)`. UI: pin/unpin picker; defaults shown when no overrides exist.
- ✅ Star rating system (overall + sound, hospitality, load-in, dressing rooms)
- ✅ Review text with show date
- ✅ Venue notes integration (from Production Bible)
- ✅ Auto-create venue profiles from advance sheet data — wired into `submitAdvanceSheet` (best-effort, admin-client)
- ✅ Times-played counter and last-played date
- ✅ Smart advance pre-fill from past venue data — `getSmartAdvanceDefaults()` looks up the most-recent SUBMITTED advance for shows whose `venue_name` matches (case-insensitive ILIKE) and copies forward stable fields (venue info, dressing rooms, security, hospitality, stage dimensions, PA, merch area) into any current-sheet blanks. Time-sensitive fields (load-in/soundcheck/doors/curfew/ticket price) are intentionally excluded. A green &ldquo;Pre-filled from {venue} on {date}&rdquo; banner tells the submitter what was carried over
- ✅ Venue photos — Cloudinary-backed upload with lightbox viewer on `/venues/[id]`, up to 24 per venue (`app/api/venues/[id]/photos/route.ts`, `venue-photos.tsx`)
- ✅ Map view at `/venues/map` — Leaflet + OpenStreetMap tiles, every venue with lat/lng rendered as a marker, popup shows name/city/capacity/times-played + deep link to the venue profile, auto-fit bounds on load

## Phase 21: Multi-Act Touring ✅
> Tour packages, festival mode, cross-act coordination.

- ✅ Tour packages (tour/festival/residency types with status tracking)
- ✅ Act management (headliner/support/opener/special guest, set length, contacts)
- ✅ Production timeline — per-date shared timeline across all acts
- ✅ Timeline blocks: load-in, soundcheck, changeover, performance, doors, meet & greet, break, curfew
- ✅ Act-specific blocks (assign to individual act or all)
- ✅ Date selector for multi-day events
- ✅ Cross-act messaging at `/packages/[id]/messages` — single channel per tour package where any act on the bill can post. Senders can pick which act they speak as (drawn from the package&apos;s `package_acts` they have org access to) or post under their plain name. Snapshots sender name + act label at send time so historical posts stay correct after renames. New `package_messages` table; broad-auth RLS (any signed-in user can read/post; only the author can edit or delete their own)
- 📋 Festival mode (multiple stages)

## Phase 22: Wellness Platform ✅
> Health and wellbeing tools for life on the road, powered by CentenarianOS and Rise Wellness.

- ✅ Daily wellness log: sleep (hours + quality), energy, mood, stress, hydration, meals, exercise, warmup, performance rating, voice condition
- ✅ 7-day averages dashboard (sleep, energy, mood, voice)
- ✅ Warmup routines: 3 seeded (Vocal Basic, Physical Stage Ready, Breathing Recovery) with step-by-step instructions and timing
- ✅ Family check-ins: group prompts with mood emoji responses
- ✅ Rise Wellness of Indiana mental health resource card
- ✅ CentenarianOS promotion page (/wellness-resources) with exercise library links, workout links, platform CTA
- ✅ Medical disclaimer component
- ✅ Links to CentenarianOS public exercise library (110+ free exercises)
- ✅ Burnout detection at `/wellness/burnout` — 14-day weighted score across sleep, energy, mood, stress, voice, and schedule density, with contributing-signal breakdown + days-off-planner recommendations
- ✅ Days-off wellness suggestions (gyms, spas, parks, food, laundromats, family-friendly) — `suggestionLinks()` deep-links to Google Maps, scoped to last-known city
- 📋 Wearable integration (via CentenarianOS)

## Phase 24: Ticketing System ✅
> Sell tickets, scan QR codes at the door, audit every entry. Anti-counterfeit signed QRs.

- ✅ Schema: `ticket_types`, `tickets`, `scan_logs` with RLS for tour staff + purchasers
- ✅ Stripe Checkout flow: `POST /api/tickets/checkout` with inventory check, guest checkout
- ✅ Webhook ticket issuance: HMAC-signed QR codes, atomic `quantity_sold` increment, refund handling
- ✅ Public buy page at `/shows/[id]/tickets` — type picker, qty, guest email
- ✅ Holder page at `/tickets/[id]` — token-authed QR display, status-aware (used / refunded / void)
- ✅ Door scanner at `/tours/[id]/shows/[showId]/scanner` — @zxing/browser camera scan, manual fallback, vibration feedback
- ✅ Manager dashboard at `/tours/[id]/shows/[showId]/tickets` — sold/scanned/revenue/refunded, per-type breakdown, scan log
- ✅ Mailgun email delivery of ticket links with `?token=<sig>`
- ✅ `ticketing` module in `featurePages` registry → landing page at `/features/ticketing`
- 📋 Stripe Connect split payments to artist/venue/crew (Phase 24.1)
- 📋 Apple/Google Wallet `.pkpass` ticket delivery
- 📋 Offline scanner cache (IndexedDB + reconciliation)

## Phase 24.5: Fan Photo Sharing ✅
> Ticket-holders share show photos to a pre-moderated public wall. Each photo gets its own sharable link.

- ✅ Schema: `fan_photos` + `fan_photo_reports` with RLS (public reads approved, poster reads own, tour staff reads all states)
- ✅ `can_post_photos_for_show(uid, show_id)` SECURITY DEFINER function — ticket-holder gate at the database
- ✅ Server-signed Cloudinary uploads via `lib/cloudinary/server.ts` (CLOUDINARY_API_SECRET stays server-only)
- ✅ POST /api/fan-photos with eligibility + file-type + size guards (10MB max, jpeg/png/webp/heic)
- ✅ Rollback of orphan Cloudinary asset when DB insert fails
- ✅ GET /api/shows/[id]/fan-photos — public list of approved photos
- ✅ GET /api/admin/fan-photos/queue — staff moderation queue
- ✅ POST /api/admin/fan-photos/[id]/moderate — approve / reject / remove, with Cloudinary destroy on reject/remove and Mailgun rejection email
- ✅ Per-show photo wall at `/shows/[id]/photos` with ticket-holder-gated uploader
- ✅ `/photos/[id]` per-photo share page with OG + Twitter Card metadata
- ✅ Fan dashboard at `/photos` showing all submissions + statuses + rejection reasons
- ✅ Staff moderation at `/tours/[id]/shows/[showId]/fan-photos` (tabs, counts, reject-with-reason flow)
- ✅ `fan-photos` module registered in featurePages
- ✅ Post-publish abuse reports UI at `/admin/photo-reports` — open-first queue, photo thumbnail + reason + reporter inline, &ldquo;N open reports&rdquo; warning chip clusters repeat offenders, two resolution paths: Dismiss (kept up) or Take down (flips photo status to `rejected` and auto-resolves any sibling reports on the same image). Resolution notes required for takedown. Filter toggle between open-only and all
- ✅ Realtime moderation queue — `fan_photos` published to Supabase Realtime; the per-show moderation page subscribes to inserts/updates and silently refreshes the queue + counts within ~600 ms of a new submission. A pulsing &ldquo;connected&rdquo; badge plus a &ldquo;N new since you opened this&rdquo; chip make the live state obvious to moderators on duty
- 📋 AI-moderation pre-filter (image safety scan before queue)

## Roadmap Completions ✅
> Quick wins and new features from user feedback.

- ✅ Persistent header with nav links (Roadmap, Demo, Log In, Sign Up) on all public pages
- ✅ Site footer with Product, For, Resources, Account sections on all public pages
- ✅ Setlist management — songs with title, duration, key, tempo, encore, team comments
- ✅ Travel arrangements — hotels, flights, rental cars, bus, equipment rental per tour
- ✅ Blog system — posts with video/audio embeds, cross-module tagging (shows, products, venues)
- ✅ Audio sharing — song demos with team comments and timestamp markers
- ✅ Multiple venue contacts on venue profiles
- ✅ CSV subscriber import for email lists
- ✅ Auto-populate state income from show revenue (DB function)
- ✅ Venues are public (anyone can browse, reducing redundancy)
- ✅ Contact sharing across teams via public venue directory
- ✅ Full CRUD: edit, delete, duplicate across all modules (reusable RecordActions component)
- 📋 Recharts analytics charts (bar, line, pie) for admin dashboard — package not installed; only stat cards rendered
- ✅ Weather integration on Show Day (Open-Meteo, cached) — wired via `lib/weather/actions.ts` (geocode + 16-day forecast + DB cache); rendered in `app/(auth)/today/weather-card.tsx`
- ✅ Smart advance pre-fill from past venue data — shipped via app-layer helper `lib/advance/smart-prefill.ts`; see Phase 20 for details
- ✅ Multiple stages/spaces per venue — new `venue_stages` table (name, location indoor/outdoor/tent/other, capacity, w×d×h, PA, notes). Stages render on the venue profile with color-coded location badges; full CRUD UI alongside the existing Contacts section. Legacy `venue_profiles.stage_*` columns retained as "default stage" for advance-sheet back-compat.
- ✅ Stripe Checkout session creation with webhook handler
- ✅ Stripe webhook: checkout.session.completed, subscription.deleted, invoice.payment_failed
- ✅ 7 admin help articles seeded (Stripe, push notifications, Cloudinary, Supabase, Vercel, codebase, dev workflow)
- ✅ Admin education academy course (5 lessons: Stripe, Mailgun, Supabase, Vercel, codebase tour) — seeded via migration `032_seed_admin_education_course.sql`

## Built since Phase 22 (not previously listed above)

- ✅ Mailgun email migration (replaced Resend across send-campaign, feedback, webhook)
- ✅ Tours INSERT...RETURNING RLS fix (migration `028`)
- ✅ User-type onboarding column (migration `027`)
- ✅ PostHog product analytics + Vercel Speed Insights
- ✅ Global help bubble on every authenticated page
- ✅ Sidebar nav reorganized into grouped sections
- ✅ Witus-outbox integration scaffolding (signed-webhook sender reference)
- ✅ Structured server-side error logging (`lib/observability/logger.ts`) wired into Stripe webhook + demo-reset cron; mirrors to PostHog `$exception` events for queryable production observability
- ✅ `engines.node >= 20` pinned in `package.json` (runtime parity local ↔ Vercel)
- ✅ `toggleLockPost()` server action for community moderation (mirrors `togglePinPost`)
- ✅ Phase 24 Ticketing System (Stripe Checkout + HMAC QR + door scanner + manager dashboard)
- ✅ Phase 24.5 Fan Photo Sharing (ticket-holder gate + Cloudinary uploads + pre-moderation + share pages)

---

## How to Request Features

Use the in-app feedback tool or open an issue on GitHub.
