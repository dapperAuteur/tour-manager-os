# Tour Manager OS — Public Roadmap

Last updated: 2026-03-30

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
- 📋 Per-module tutorial (3-5 step walkthrough on first access)

## Phase 4: Tour Money Tracker ✅
> Real-time P&L per show and per tour. Per-member financial views.

- ✅ Expense tracking by category (travel, hotel, per diem, meals, equipment, crew, merch, marketing, insurance, other)
- ✅ Add expense form with show association and tax-deductible flag
- ✅ Show revenue tracking (guarantee, ticket sales, merch, other)
- ✅ Tour P&L dashboard (total revenue, total expenses, net profit, expenses by category)
- ✅ Per-member financial view (/me/finances — expenses, payouts, owed, tax deductible)
- ✅ CSV export for expenses
- ✅ Settlements and member payouts tables
- 📋 Receipt capture with AI scanning (Gemini vision API)
- 📋 Receipt image viewing linked to transactions
- 📋 Expense cost splitting between team members

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
- 📋 Weather integration

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

## Phase 8: Merch Empire ✅
> Inventory tracking, per-show sales, merch P&L.

- ✅ Product catalog (name, SKU, category, price, cost basis)
- ✅ Inventory tracking per tour (start quantity, remaining)
- ✅ Per-show merch sales recording with auto inventory update
- ✅ Merch P&L dashboard (revenue, cost, profit, units sold, top sellers)
- ✅ Demo data: 5 products, inventory, 11 sales across 3 shows
- 📋 Online merch store (Stripe payments)
- 📋 Tour-exclusive merch drops

## Phase 9: Fan Marketing & Community ✅
> Email marketing and community discussion boards.

- ✅ Email list management (create lists, add subscribers manually)
- ✅ Email campaign builder (subject, content, list targeting, scheduling)
- ✅ Marketing dashboard (subscribers, lists, campaigns, sent count)
- ✅ Community categories (admin creates, members browse)
- ✅ Discussion posts with threaded replies
- ✅ Pin/lock posts (admin moderation)
- ✅ Author display names on posts and replies
- 📋 Email sending integration (Resend)
- 📋 CSV subscriber import
- 📋 Public event pages per show
- 📋 Pre/post-show exclusive content

## Phase 10: Family Tour Hub ✅
> Polls, practice scheduling, shared albums, group collaboration.

- ✅ Family polls with multi-option voting, progress bars, open/close control
- ✅ Practice session scheduling with date/time/location and RSVP (going/maybe/can't)
- ✅ Shared photo/video albums per tour with media management
- ✅ Hub index page with Polls, Practice, Albums sections
- ✅ 404 pages (public and authenticated)
- 📋 Setlist collaboration
- 📋 Days-off planner with local suggestions

## Phase 11: Help & Feedback ✅
> Help center and conversational feedback system.

- ✅ Help center with searchable articles (7 seeded: getting started, advance sheets, finances, show day, merch, polls, accessibility)
- ✅ Article detail pages with markdown-like rendering
- ✅ Conversational feedback threads (bug/feature/question/praise)
- ✅ Threaded messages with sender names and admin badges
- ✅ Admin feedback management with status control (open → in_progress → resolved → closed)
- ✅ Admin sees user name on every thread with link context
- ✅ User notifications on admin replies
- ✅ Priority levels (low/normal/high/urgent)
- 📋 AI-powered help (Gemini + pgvector semantic search)

## Phase 12: Admin Dashboard ✅
> Analytics, metrics, logs, user management.

- ✅ Admin dashboard (/admin/dashboard) — platform stats: users, orgs, tours, shows
- ✅ Financial metrics — total revenue, expenses, merch revenue across all orgs
- ✅ Feedback metrics — total threads, open/in-progress count
- ✅ User management (/admin/users) — all users with email, org, role, paid status, join date, last sign-in
- ✅ Activity logs (/admin/logs) — action, user, resource, timestamp
- ✅ Fuzzy search on help articles and feedback threads (pg_trgm)
- ✅ Reusable search bar component
- 📋 User engagement metrics (DAU/WAU/MAU, session duration)
- 📋 Module adoption rates
- 📋 Charts and graphs (Recharts)

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
- 📋 Admin education tool (codebase reference)

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
- 📋 Auto-populate state income from show revenue

## Phase 15: Production Bible ✅
> Equipment inventory, stage plots, input lists, and venue notes.

- ✅ Equipment inventory (14 categories, condition tracking, travels/stays flag, serial numbers)
- ✅ Stage plots (name, dimensions, default flag, show association)
- ✅ Input lists / patch sheets (channel-by-channel with instrument, mic, DI, phantom power)
- ✅ Venue notes (searchable by venue name, categorized: load-in, parking, stage, sound, etc.)
- ✅ Production hub index with 4 section cards
- 📋 Drag-and-drop stage plot builder (visual editor)
- 📋 Auto-generated crew call sheets
- 📋 Rider compliance checklists

## Phase 16: Subscriptions, CSV, & Email Docs ✅
> Billing, data import/export, and email setup documentation.

- ✅ Subscription system (lifetime $103.29 one-time + annual $103.29/yr after 100 lifetime sold)
- ✅ Pricing page with lifetime spots counter and annual unlock status
- ✅ Admin subscriptions dashboard (lifetime sold/remaining, annual count, total revenue)
- ✅ Promo code system (percentage/fixed discounts, max uses, expiry, lifetime grants)
- ✅ Stripe checkout API route (ready for STRIPE_SECRET_KEY config)
- ✅ CSV templates for 7 data types (shows, expenses, contacts, equipment, merch, subscribers, state income)
- ✅ Data Import/Export page with template downloads
- ✅ Email setup documentation in Help Center (Resend setup, DNS, API key, testing)
- ✅ Email Marketing academy course (3 lessons: building lists, campaigns, admin setup)
- 📋 Stripe Checkout session creation (needs Stripe price IDs configured)
- 📋 CSV import wizard with column mapping and validation
- 📋 Webhook handler for Stripe events

## Phase 17: Email Integration ✅
> Send marketing emails with open/click tracking via Resend.

- ✅ Resend SDK integration for email delivery
- ✅ Campaign send action with batch processing (10 at a time)
- ✅ Open tracking via 1x1 pixel (auto-increments opened_count)
- ✅ Click tracking via redirect endpoint (auto-increments clicked_count)
- ✅ Unsubscribe link with confirmation page
- ✅ Campaign detail page with analytics (recipients, opens, clicks, open/click rates)
- ✅ Send button with confirmation dialog
- ✅ Resend webhook handler (bounces auto-unsubscribe, spam complaints auto-unsubscribe)
- ✅ HTML email template with tracking pixel and footer
- ✅ Graceful fallback when Resend not configured
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
- 📋 Additional endpoints (finances, merch, contacts)
- 📋 Rate limiting enforcement middleware
- 📋 OpenAPI/Swagger spec generation

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
- ✅ Star rating system (overall + sound, hospitality, load-in, dressing rooms)
- ✅ Review text with show date
- ✅ Venue notes integration (from Production Bible)
- ✅ Auto-create venue profiles from advance sheet data
- ✅ Times-played counter and last-played date
- 📋 Smart advance pre-fill from past venue data
- 📋 Venue photos
- 📋 Map view with Leaflet

## Phase 21: Multi-Act Touring ✅
> Tour packages, festival mode, cross-act coordination.

- ✅ Tour packages (tour/festival/residency types with status tracking)
- ✅ Act management (headliner/support/opener/special guest, set length, contacts)
- ✅ Production timeline — per-date shared timeline across all acts
- ✅ Timeline blocks: load-in, soundcheck, changeover, performance, doors, meet & greet, break, curfew
- ✅ Act-specific blocks (assign to individual act or all)
- ✅ Date selector for multi-day events
- 📋 Cross-act messaging/communication channels
- 📋 Festival mode (multiple stages)

## Phase 22: Wellness Platform 💡
> Health and wellbeing tools for life on the road, powered by CentenarianOS and Rise Wellness.

- 💡 Sleep tracking relative to timezone changes
- 💡 Vocal/physical warmup reminders with embedded routines
- 💡 Mood/energy tracking per show
- 💡 Burnout detection (schedule density + self-reported energy)
- 💡 Hydration and rest reminders
- 💡 Days-off wellness suggestions (gyms, spas, parks near venues)
- 💡 Rise Wellness of Indiana mental health resource card
- 💡 Links to CentenarianOS public exercise library (free, no account needed)
- 💡 CentenarianOS promotion page with benefits and CTA to join
- 💡 Medical disclaimer component

---

## How to Request Features

Use the in-app feedback tool or open an issue on GitHub.
