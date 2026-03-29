# Tour Manager OS - Product Vision & MVP Plan

## Context

A family of touring musicians (in the tradition of groups like Sister Sledge) currently manages their touring operations using a patchwork of Excel advance sheets, printed daily itinerary templates, and Eventric's Master Tour software ($59.99/mo). They want a single custom platform that consolidates tour logistics, marketing, finances, merch, fan engagement, practice scheduling, and family collaboration. This document presents 3 MVP strategies and 3 final product visions per MVP.

---

## Non-Negotiable Requirements

- **ARIA Compliant / Accessibility First** - All components must meet WCAG 2.1 AA standards. Use semantic HTML, proper ARIA labels, keyboard navigation, screen reader support, focus management, and sufficient color contrast ratios.
- **Light/Dark Mode** - Full theme support from day one. Use Tailwind's `dark:` variant with system preference detection and manual toggle.
- **Mobile First** - Design for mobile screens first, then scale up. Touch targets, responsive layouts, swipe gestures.
- **Offline Mode** - As many features as possible must work offline. Musicians tour in areas with unreliable internet. Use service workers (PWA), IndexedDB for local data caching, and background sync when connectivity returns. Prioritize: daily itinerary viewing, expense entry, schedule viewing, announcements (read). Sync strategy: optimistic local writes, queue changes, reconcile on reconnect.

## Development Workflow

- **Feature branches** - New branch for each implementation step
- **Small incremental commits** - Atomic changes so bugs can be caught early
- **Commit messages with each step** - Clear, descriptive messages
- **User confirmation** - Pause after each step for review before proceeding

---

## What We Learned From Their Current Workflow

### The Advance Sheet (Excel)
A questionnaire emailed to venues before each show, collecting:
- Venue details (type, capacity, dressing rooms, amenities, stage dimensions, PA system, smoke machines)
- Key contacts: promoter, production company, caterer, PR, sponsors, security
- Per diem arrangement ($50/day cash to road manager)
- Sound check & show details (times, format, performance length, doors, curfew, ticket prices, gross)
- Other artists on the bill (support acts A-D + headliner with set times)
- Ground transportation (company, driver, distances, airport logistics)
- Hotel & flight info (confirmation numbers, room counts, airline details)

### The Daily Itinerary (Printed Template)
A single-page daily reference for every member containing:
- Header: artist name, date, city, travel day vs. show day designation
- Travel info: distance, drive time, driver name/phone, bus call time
- Day schedule: arrival, departure to venue, hotel info with confirmation
- Full day timeline: breakfast, lunch, load-in, soundcheck, dinner, doors, meet & greet, show time, set length, other acts
- Production: loaders, load-in/out times, security, stage dimensions, smoking policy, merch area
- Sound company info
- Departure: time, next destination, distance, next day arrival

### Master Tour (Eventric) - What They Like
- Unlimited tours/acts from one account
- Real-time collaboration
- 150K+ personnel database
- Push notifications
- Accounting reports
- Mobile app access

### What They Want Beyond Tour Management
- Marketing tools for the musicians
- Financial management (expenses, taxes, write-offs)
- Merch sales tracking and online store
- Exclusive content delivery to fans
- Practice scheduling
- Days off management
- Group decision-making tools (polls, voting)

---

## MVP 1: "The Digital Advance Sheet"

**Core idea:** Replace the Excel advance sheet with a smart web form that venues fill out online, which auto-generates the daily itinerary. Attacks the most painful bottleneck: chasing venue contacts for spreadsheet data, then manually transcribing it.

### What it does (3-4 weeks)
1. Tour manager creates a tour (name, dates, shows)
2. Each show generates a unique shareable link
3. Venue contacts receive the link and fill out a structured form matching the exact advance sheet fields
4. As data arrives, the system auto-populates daily itinerary views
5. Tour manager adds travel/hotel/flight info to complete each day
6. Generates a printable daily itinerary matching the template format they already use

### Data model
- `tours` - name, artist, dates, created_by
- `tour_members` - tour_id, user_id, role (manager/member/crew)
- `shows` - tour_id, date, city, state, venue, status (draft/advance_sent/confirmed)
- `advance_sheets` - show_id, token, status, all venue fields (type, capacity, stage dimensions, PA, etc.)
- `advance_contacts` - role-based contacts (promoter, production, catering, PR, security)
- `advance_other_artists` - support acts with set times
- `itinerary_days` - date, type (travel/show/off), transportation, hotel, notes
- `itinerary_schedule_items` - time, label, notes, sort order

### Key pages
- `/dashboard` - tour overview with show status cards
- `/tours/[id]` - tour detail with date-sorted show list
- `/tours/[id]/shows/[showId]` - show detail pulling from advance sheet
- `/tours/[id]/itinerary` - day-by-day itinerary view, printable
- `/advance/[token]` - public form for venues (no login required)

### Why it wins
Zero data re-entry. The venue fills out a form once and the itinerary writes itself. Master Tour has no venue-facing data collection workflow.

---

### Final 1A: "The Venue Network"
The advance sheet grows into a **two-sided marketplace**. Every venue that fills out a form joins a growing database. Return engagements get pre-populated data. Other touring acts can access venue profiles, creating crowd-sourced venue intelligence.

- Venue profiles with ratings, photos, rider compliance history
- "Smart advance" pre-fills from past data
- Venue search/discovery for booking agents
- Monetization: premium venue profiles, database access fees
- Songkick/Bandsintown integration for show announcements

### Final 1B: "The Production Bible"
The advance sheet becomes the foundation for **comprehensive production management**.

- Drag-and-drop stage plot builder linked to venue stage dimensions
- Input list / patch sheet management per venue
- Equipment inventory tracking (what travels vs. what's provided)
- Auto-generated crew call sheets
- Rider compliance checklists
- Load-in/out time optimization
- Historical production notes per venue ("loading dock is around back")

### Final 1C: "The Family Tour Hub"
The advance sheet stays the backbone, but the product grows toward **family-specific collaboration and life on the road**.

- Per-member daily views with personalized schedules
- Family group chat integrated into each show/day
- Shared photo/video albums per tour
- "Days off" planner with local suggestions (restaurants, activities) via maps
- Family polls for group decisions ("Add a Nashville date?")
- Practice room scheduling and setlist collaboration
- Shared expense tracking within the family

---

## MVP 2: "The Tour Money Tracker"

**Core idea:** Start with **financial visibility**. Most touring musicians have no real-time view into tour profitability. Focus on: "Are we making money on this tour?"

### What it does (3-4 weeks)
1. Create a tour with expected shows
2. Per show: enter guaranteed fee, ticket price, capacity, gross potential, merch sales
3. Track expenses by category: travel, hotel, per diem, meals, equipment, crew
4. Real-time dashboard: revenue vs. expenses per show, per tour, running total
5. Per-member financial view (each person sees their share, per diem balance, personal expenses)
6. Receipt capture via phone camera
7. CSV export for accountant/tax prep

### Data model
- `tours`, `tour_members` (with daily_rate, per_diem_rate)
- `shows` - guarantee, ticket_price, capacity, actual_sold, gross_revenue, merch_revenue
- `expenses` - category, amount, receipt_url, is_tax_deductible, status (pending/approved/reimbursed)
- `settlements` - per-show P&L
- `member_payouts` - share, per diem, reimbursement, paid status

### Key pages
- `/dashboard` - tour P&L at a glance (total revenue, expenses, net)
- `/tours/[id]/finances` - show-by-show breakdown
- `/tours/[id]/expenses` - expense list with receipts, filterable
- `/tours/[id]/expenses/new` - quick-add with camera capture
- `/me/finances` - personal financial view per member
- `/tours/[id]/settlements` - per-show settlement

### Why it wins
Master Tour's accounting is built for tour accountants. This gives each musician a personal, comprehensible view. No one wants accounting software; they want to see "we made $4,200 profit in Atlanta."

---

### Final 2A: "The Musician Tax Platform"
Financial tracking grows into **full tax prep and financial planning for touring musicians**.

- Automatic per diem tracking against IRS guidelines
- Mileage and home studio deductions
- State-by-state tax liability calculator (musicians owe taxes in every state they perform)
- QuickBooks/Xero integration
- Year-end tax packages (1099s, deduction summaries, state filing lists)
- Tour financial projections ("Add 5 dates at $X = $Y net")
- Royalty/publishing income tracking alongside tour income

### Final 2B: "The Merch Empire"
The financial foundation expands into a **complete merch operation**.

- Inventory management (SKUs, quantities, cost basis)
- Per-show merch sales with running inventory counts
- Pricing optimization based on city/venue data
- Online merch store (Stripe) integrated with tour dates
- "Tour exclusive" drops tied to specific shows
- Consignment tracking for venue merch sellers
- Fan purchase history and email capture at point of sale
- Merch P&L separate from show P&L

### Final 2C: "The Family Music Business OS"
The financial core grows into **comprehensive business management** for the family entity.

- Contract management (upload, track terms)
- Invoice generation for promoters/venues
- Family business calendar (tours, rehearsals, recording, press)
- Revenue stream dashboard (touring, merch, streaming, licensing, appearances)
- Business entity management (LLC/S-Corp)
- Cash flow forecasting across tours
- Vendor/supplier management
- Document vault (insurance, contracts, rider, W-9s)

---

## MVP 3: "The Show Day App"

**Core idea:** Start from the **individual member's daily experience**. Not a management tool — a **personal daily companion** each member opens every morning. Mobile-first. The itinerary template JPG is the design spec.

### What it does (2-3 weeks)
1. Tour manager enters tour schedule and daily details
2. Each member gets a mobile-optimized daily view
3. Daily view mirrors the itinerary template: today's schedule, venue info (tap-to-navigate), hotel info (tap-to-call), weather, countdown to soundcheck/showtime
4. Push notifications for schedule changes
5. Swipe between days
6. "Next up" widget always showing what's coming

### Data model
- `tours`, `tour_members` (with push_token)
- `tour_days` - date, type (travel/show/off), city, state, timezone, weather
- `schedule_blocks` - start/end time, title, category, location, notes, is_mandatory
- `venues` - name, address, phone, capacity, stage_dimensions, lat/lng
- `hotels` - name, address, phone, confirmation, amenities, check-in/out
- `announcements` - from tour manager, priority (normal/urgent)

### Key pages
- `/today` - hero screen: complete schedule, weather, venue card, hotel card
- `/today/venue` - venue detail with map, contacts, stage info
- `/today/hotel` - hotel detail with map, confirmation, amenities
- `/schedule` - week/month calendar view
- `/announce` - tour announcements feed

### Why it wins
Master Tour is a management tool. This is a **member tool**. No family member wants to log into a tour management platform. They want "Soundcheck at 3, doors at 7, you're on at 9:15, hotel is 4 miles away."

---

### Final 3A: "The Fan Connection Platform"
The personal show-day experience extends outward to **fans**.

- Public event pages per show with venue info and ticket links
- Pre-show behind-the-scenes content (stories-style)
- Post-show exclusive content for ticket holders
- Fan check-in at shows (QR code) building concert history
- Moderated direct messaging between fans and family
- Auto-generated tour diary/blog from daily data + member posts
- Email list capture per city for return engagement marketing

### Final 3B: "The Touring Artist Wellness Platform"
The daily companion grows into a **health and wellbeing tool for life on the road**.

- Sleep tracking relative to timezone changes
- Meal planning around show schedules
- Vocal/physical warmup reminders with embedded routines
- Days off wellness suggestions (gyms, spas, parks) on map
- Mood/energy tracking per show
- Hydration and rest reminders
- Family check-in prompts ("How's everyone feeling about the tour?")
- Burnout detection based on schedule density + self-reported energy

### Final 3C: "The Multi-Act Touring Platform"
The show-day app scales from one family to **multiple acts sharing a bill**.

- Multi-act schedule coordination
- Shared production timeline (load-in order, soundcheck rotation, changeovers)
- Cross-act communication channels
- Festival mode (multiple stages, multiple days)
- Support acts become first-class users (from the advance sheet's "other artists")
- Promoter view showing all acts' statuses
- Scales to tour packages, residencies, festival circuits

---

## Long-Term Vision: All Paths Converge

The final product incorporates features from ALL 9 final visions. MVP 1 is the starting point, then we layer in features from all paths:

**Phase 1 (MVP 1):** Digital Advance Sheet + Auto-Generated Itinerary
**Phase 2:** Tour Money Tracker (expenses, P&L, per-member finances, receipt capture)
**Phase 3:** Show Day App (member daily companion, mobile-first)
**Phase 4:** Merch Empire (inventory, sales, online store)
**Phase 5:** Fan Connection Platform (public pages, exclusive content, email capture)
**Phase 6:** Family Tour Hub (polls, practice scheduling, shared albums, group chat)
**Phase 7:** Musician Tax Platform (state-by-state, deductions, year-end packages)
**Phase 8:** Production Bible (stage plots, equipment inventory, crew call sheets)
**Phase 9:** Venue Network (crowd-sourced venue database, smart advance pre-fill)
**Phase 10:** Multi-Act Touring (festival mode, cross-act coordination)
**Phase 11:** Wellness Platform (sleep, warmups, burnout detection)

---

## Cross-Cutting Features (Apply to All Phases)

### CSV Import/Export
- Users can upload CSV files to bulk-import tours, shows, contacts, expenses, merch inventory
- All data views (expenses, settlements, merch sales, contacts) export to CSV
- Use Papa Parse for client-side CSV parsing, server-side SQL `COPY` for bulk operations
- Import wizard with column mapping and validation preview

### PDF Export
- Printable daily itinerary (matching the JPG template format)
- Tour summary PDF (all shows, financials, contacts)
- Show advance sheet PDF (filled-in version for records)
- Settlement reports
- Tax summary reports
- Use `@react-pdf/renderer` for structured PDFs

### Templates
- Advance sheet templates (different forms for club vs. theater vs. festival vs. outdoor)
- Itinerary templates (customize layout and included fields)
- Email templates for sending advance sheets to venues
- Expense report templates
- Settlement templates
- Stored as JSONB form schemas in Supabase, user-editable

### Show FAQ & Tour FAQ Pages
- `/tours/[id]/faq` - Tour-level FAQ page: important documents, policies, contacts, emergency info, per diem details, general tour rules
- `/tours/[id]/shows/[showId]/faq` - Show-level FAQ page: venue-specific info, parking, load-in instructions, dressing room location, catering details, local emergency numbers
- Both pages serve as a single destination for any member to find all important info
- Manager edits FAQ content; members view it
- Available offline (cached in IndexedDB)
- Each FAQ entry can have attached documents (rider, contracts, venue maps)

### Document Hub
- `/tours/[id]/documents` - All important documents for a tour in one place
- `/tours/[id]/shows/[showId]/documents` - Show-specific documents
- Categories: contracts, riders, insurance, W-9s, venue maps, production specs, press materials
- Upload via Supabase Storage, tagged and searchable
- Version history for updated documents
- Offline access for pinned/starred documents

### SEO, Social Media & Marketing Optimization

Every page must be optimized for search engines, social media previews, and marketing:

**Required Metadata (all pages):**
- Unique `<title>` via Next.js `metadata.title` — descriptive, under 60 chars
- `<meta name="description">` — compelling, 120-160 chars, includes keywords
- Canonical URL via `metadata.alternates.canonical`
- `robots` meta — index public pages, noindex authenticated/private pages

**Open Graph (all public pages):**
- `og:title` — matches or improves on `<title>`
- `og:description` — optimized for social sharing
- `og:image` — 1200x630 branded preview image (auto-generated or template)
- `og:url` — canonical URL
- `og:type` — `website` for landing pages, `article` for blog/academy content
- `og:site_name` — "Tour Manager OS"

**Twitter Cards (all public pages):**
- `twitter:card` — `summary_large_image`
- `twitter:title`, `twitter:description`, `twitter:image`
- `twitter:site` — platform Twitter handle (when available)

**Structured Data / JSON-LD (where applicable):**
- Landing page: `Organization` schema
- Module feature pages: `SoftwareApplication` schema
- Academy courses: `Course` schema
- Public event pages (future): `Event` + `MusicEvent` schema
- FAQ pages: `FAQPage` schema

**Page-specific requirements:**

| Page | Title Pattern | Index | OG Image |
|------|--------------|-------|----------|
| `/` (landing) | "Tour Manager OS — Tour Management Built for Musicians" | Yes | Branded hero |
| `/for/[type]` | "Tour Manager OS for [Type]" | Yes | Role-specific |
| `/features/[slug]` | "[Module Name] — Tour Manager OS" | Yes | Module screenshot |
| `/login` | "Log In — Tour Manager OS" | No | N/A |
| `/signup` | "Sign Up — Tour Manager OS" | No | N/A |
| `/advance/[token]` | "[Artist] Advance Sheet — [Venue]" | No | N/A |
| `/dashboard` | "Dashboard — Tour Manager OS" | No | N/A |
| `/tours/[id]` | "[Tour Name] — Tour Manager OS" | No | N/A |
| `/tours/[id]/itinerary` | "Itinerary — [Tour Name]" | No | N/A |
| `/settings` | "Settings — Tour Manager OS" | No | N/A |
| `/academy` | "Academy — Learn Tour Manager OS" | Yes | Branded |
| `/academy/[course]` | "[Course Title] — Tour Manager OS Academy" | Yes | Course thumbnail |
| `/community` | "Community — Tour Manager OS" | No | N/A |

**Technical SEO:**
- `sitemap.xml` auto-generated via Next.js `app/sitemap.ts` (public pages only)
- `robots.txt` via `app/robots.ts` — allow crawling of public pages, block authenticated routes
- Proper heading hierarchy (`h1` → `h2` → `h3`) on every page
- Alt text on all images
- Semantic HTML (`<main>`, `<nav>`, `<article>`, `<section>`)
- Fast page loads (target < 2s LCP) — Server Components, minimal client JS

**Social sharing helpers:**
- Public event pages get a "Share" button with pre-filled text for Twitter/Facebook/copy link
- Academy courses have social share buttons
- Landing pages have proper OG images that look good when shared on Slack, Discord, Twitter, Facebook, LinkedIn

### Localization & Time
- All dates/times display in the user's local timezone
- Timezone auto-detected from browser, overridable in settings
- Tour schedule stores times in venue-local timezone with UTC offset
- Member views convert to their personal timezone with "(venue time: X)" annotation

---

## Module System & Feature Gating

### How It Works
Every major feature area is a **module** that can be turned on/off at the organization level (by admin) and opted into at the member level.

### Module Registry
Each module has:
- `id` - unique slug (e.g., `advance-sheets`, `finances`, `merch`, `fan-engagement`)
- `name` - display name
- `description` - what it does, who it's for
- `status` - `enabled` | `disabled` | `coming_soon`
- `tier` - which subscription tier includes it (free, pro, enterprise)
- `tutorial_url` - link to in-app tutorial
- `icon` - Lucide icon name

### Data model
- `modules` - id, name, description, status, tier, tutorial_url, icon, sort_order
- `org_modules` - org_id, module_id, enabled (admin toggles modules on/off for the org)
- `member_module_access` - member_id, module_id, status (active | requested | revoked), granted_by, granted_at
- `module_tutorials` - module_id, step_number, title, content, media_url, media_type

### Admin control
- `/admin/modules` - Toggle modules on/off for the organization
- When a module is off, its nav items, pages, and API routes are hidden/blocked
- Admin can see which members have opted into each module

### Member experience
- `/modules` - Browse available modules with descriptions and tutorials
- Members can **opt in** to enabled modules or **request access** to restricted ones
- Request triggers a notification to admin for approval
- First time opening a module shows a short interactive tutorial (3-5 steps with screenshots/animations)

### Implementation
- Middleware checks `org_modules` + `member_module_access` before rendering module pages
- Nav component filters items based on member's active modules
- API routes return 403 if module not enabled for the requesting member
- Feature flags stored in Supabase, cached client-side for offline access

---

## Module Tutorials & Academy

### Per-Module Tutorials
- Each module has a 3-5 step interactive walkthrough
- Steps: title, description, screenshot/animation, optional "try it" action
- Shown on first module access, re-accessible from module settings
- Built with a lightweight tooltip/spotlight component (no heavy library)

### Academy / LMS (`/academy`)
- Full learning management system for deep education on the platform
- **Courses** organized by topic: "Getting Started", "Tour Finances 101", "Merch Management", "Marketing Your Band", "Tax Tips for Touring Musicians"
- Each course has **lessons** with rich text content (Tiptap), embedded videos, and quizzes
- Progress tracking per user (lessons completed, courses finished)
- Certificates of completion (PDF export)
- Admin can create/edit courses

### Data model
- `courses` - id, title, description, thumbnail_url, category, difficulty, estimated_minutes, sort_order, published
- `lessons` - id, course_id, title, content (rich text), video_url, sort_order, published
- `lesson_quizzes` - id, lesson_id, question, options (JSONB), correct_answer, explanation
- `user_course_progress` - user_id, course_id, status (not_started | in_progress | completed), started_at, completed_at
- `user_lesson_progress` - user_id, lesson_id, completed, completed_at, quiz_score

---

## Help & Support System

### RAG-Powered Help (`/help`)
- AI-powered help assistant that answers questions about the platform
- Indexed against: module tutorials, academy content, FAQ pages, documentation
- Uses embeddings stored in Supabase (pgvector) for semantic search
- Contextual: knows which module the user is currently in
- Suggests relevant tutorials and academy courses
- Fallback: creates a feedback ticket if AI can't answer

### Feedback Tool (`/feedback`)
- Conversational feedback system — not a form, a **threaded conversation**
- Users submit feedback, bug reports, or feature requests as messages
- Each feedback thread has: subject, category (bug | feature | question | praise), priority, status (open | in_progress | resolved | closed)
- **Dev notification**: new feedback sends push notification + email to admin
- **Admin responds in-thread**: the user sees the response in their feedback view, gets notified
- Conversation history preserved

### Data model
- `feedback_threads` - id, user_id, subject, category, priority, status, created_at, updated_at
- `feedback_messages` - id, thread_id, sender_id, sender_role (user | admin), content, attachments (JSONB), created_at
- `feedback_notifications` - id, thread_id, recipient_id, read, created_at
- `help_embeddings` - id, source_type (tutorial | lesson | faq | doc), source_id, content_chunk, embedding (vector)

---

## Admin Dashboard (`/admin`)

### Overview
- Single pane of glass for the platform owner (you) to manage everything

### Analytics & Metrics (`/admin/analytics`)
- **User engagement**: DAU/WAU/MAU, session duration, most-used modules, feature adoption rates
- **Tour metrics**: tours created, shows managed, advance sheets sent vs. completed
- **Financial metrics**: total revenue tracked, expenses logged, settlements processed
- **Module adoption**: which modules are enabled, opted-in rates, tutorial completion rates
- **Content metrics**: academy course completion rates, help queries, feedback volume
- Charts and graphs (use Recharts or Chart.js)

### User Benefit Tracking (`/admin/impact`)
- Dashboard showing how users benefit from the tool
- Time saved: estimated hours saved vs. manual process (advance sheet completion time, itinerary generation)
- Money tracked: total P&L visibility provided
- Data points: shows managed, documents stored, expenses tracked
- Exportable for presentations and investor decks

### Logs (`/admin/logs`)
- Activity log: who did what, when (user actions, module access, data changes)
- System log: errors, API failures, sync conflicts
- Filterable by user, module, action type, date range

### Feedback Management (`/admin/feedback`)
- All feedback threads in one view
- Filter by status, category, priority, user
- Respond to users in conversational thread
- Mark resolved, assign priority
- Aggregate feedback into feature request tracking

### Admin Education Tool (`/admin/learn`)
- Teaches YOU (the admin/developer) about the codebase and development process
- **Codebase Explorer**: visual map of the project architecture, key files, data flow diagrams
- **Tech Stack Guide**: what each technology does and why it was chosen
- **Development Process**: how features were built, git workflow, deployment pipeline
- **Presentation Mode**: polished slides/cards you can use in interviews or investor presentations
- **Key Metrics Storytelling**: auto-generates talking points from analytics data ("The platform has managed X tours across Y venues, tracking $Z in revenue")
- Content is hand-curated + auto-generated from codebase analysis

---

## Marketing & Community

### Fan Marketing Emails (`/marketing`)
- Band members can send marketing emails to their fan email lists
- Email list built from: merch purchases, show check-ins, newsletter signups, exclusive content access
- **Segments**: by city, show attendance history, merch purchase history, engagement level
- **Templates**: tour announcement, show reminder, merch drop, exclusive content, newsletter
- **Builder**: drag-and-drop email builder (or Tiptap rich text)
- **Scheduling**: send now or schedule for later
- **Analytics**: open rates, click rates, unsubscribes
- Integration: Resend or SendGrid for transactional + marketing email delivery
- CAN-SPAM compliance: unsubscribe links, physical address, opt-in confirmation

### Community (`/community`)
- Fan community space tied to the artist
- **Discussion boards**: organized by topic (tour talk, music, merch, general)
- **Announcements**: band posts that pin to the top
- **Fan profiles**: concert history, merch collection, badges/achievements
- **Moderation**: admin and designated members can moderate
- **Exclusive areas**: VIP sections for subscribers or merch buyers

### Data model
- `email_lists` - id, name, description, created_by
- `email_subscribers` - id, list_id, email, name, city, source (merch | check_in | signup), subscribed_at, unsubscribed_at
- `email_campaigns` - id, list_id, subject, content, template_id, status (draft | scheduled | sent), scheduled_at, sent_at, stats (JSONB)
- `community_categories` - id, name, description, sort_order, access_level (public | members | vip)
- `community_posts` - id, category_id, author_id, title, content, pinned, locked, created_at
- `community_replies` - id, post_id, author_id, content, created_at
- `community_members` - id, user_id, display_name, bio, badges (JSONB), joined_at

---

## Monetization & White Label

### Subscription Management (`/admin/subscriptions`)
- Admin can market and sell annual subscriptions to other bands/artists
- **Tiers**: Free (limited modules), Pro (all modules), Enterprise (white label + API)
- Stripe integration for recurring billing
- Trial periods, upgrade/downgrade flows
- Usage limits per tier (tours, members, storage)

### White Label (`/admin/white-label`)
- Other bands/organizations can get their own branded version
- Customizable: logo, colors, fonts, domain (CNAME)
- Each white label instance is an isolated organization in the same database (multi-tenant)
- Admin manages all white label instances from the master admin dashboard

### Data model
- `organizations` - id, name, slug, logo_url, brand_colors (JSONB), custom_domain, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id
- `subscription_tiers` - id, name, price_monthly, price_annual, features (JSONB), limits (JSONB)

### Public API (`/api/v1/`)
- RESTful API for third-party integrations
- Endpoints: tours, shows, itineraries, contacts, finances (read), merch (read/write)
- API key authentication (per organization)
- Rate limiting per tier
- OpenAPI/Swagger documentation at `/api/v1/docs`
- Webhook support for events (show created, advance sheet completed, settlement finalized)

### Data model
- `api_keys` - id, org_id, key_hash, name, scopes (JSONB), rate_limit, last_used_at, expires_at
- `api_logs` - id, api_key_id, method, path, status_code, response_time_ms, created_at
- `webhooks` - id, org_id, url, events (JSONB), secret_hash, active

---

## Demo System

### Demo Users
Pre-configured demo accounts, each with a different access level to showcase the platform:

| Demo User | Role | Modules | Purpose |
|-----------|------|---------|---------|
| **Demo Tour Manager** | manager | ALL modules | Full admin experience — the "try everything" account |
| **Demo Band Member** | member | Show Day, Finances (personal), Merch, Community | Typical member view — see schedule, track expenses, browse community |
| **Demo Crew Member** | crew | Show Day, Production, Documents | Crew perspective — production info, schedules, documents |
| **Demo Venue Contact** | venue | Advance Sheet (their show only) | Venue experience — fill out advance sheet, see confirmation |
| **Demo Fan** | fan | Community, Events, Merch Store | Fan perspective — browse events, shop merch, join community |

### Single-Button Demo Login
- Landing page has "Try Demo" button
- Opens a modal with role cards (Tour Manager, Band Member, Crew, Venue, Fan)
- Selecting a role logs in instantly (no email/password) using Supabase magic link to a pre-configured demo account
- **Full access demo**: prominent "Try Everything" button logs in as Demo Tour Manager with all modules enabled
- Demo banner at top: "You're viewing a demo. [Sign up for your own account →]"
- Demo data resets periodically (daily cron job or on-demand)

### Realistic Demo Data
Pre-seeded data that tells a compelling story:

- **Demo Band**: "The Roadwell Family" — a 5-member family band
- **2 completed tours** with real-looking data (cities, venues, financials)
- **1 active tour** with upcoming shows, some advance sheets completed, some pending
- **Financial data**: realistic guarantees ($2K-$15K), expenses, settlements, P&L showing profitability trends
- **Merch inventory**: t-shirts, vinyl, posters with sales history
- **Fan email list**: 500+ demo subscribers across cities
- **Community posts**: sample discussions, announcements
- **Academy progress**: some courses partially completed
- **Feedback threads**: sample conversations showing the feedback flow
- **Documents**: sample contracts, riders, venue maps (placeholder PDFs)

### Data model
- `demo_accounts` - id, role, email, display_name, modules_enabled (JSONB), description
- Demo data seeded via a migration script (`supabase/seed.sql`) that can be re-run to reset

---

## User Settings (`/settings`)

### Profile (`/settings/profile`)
- Display name, avatar, bio
- Email address (with verification flow)
- Phone number
- Contact preferences (email, SMS, push)

### Preferences (`/settings/preferences`)
- **Home page**: choose which page loads on login (dashboard, today view, schedule, custom)
- **Timezone**: auto-detected, manually overridable, affects all date/time displays
- **Theme**: light / dark / system (persisted in localStorage + Supabase for cross-device sync)
- **Language**: future-proofing (English default)
- **Notifications**: granular control per notification type (schedule changes, feedback replies, advance sheet updates, announcements)

### Modules (`/settings/modules`)
- View active modules
- Opt into available modules
- Request access to restricted modules
- Re-watch module tutorials

### Data & Privacy (`/settings/data`)
- Export all personal data (CSV download)
- Delete account (with confirmation flow)
- Data retention preferences

---

## Landing Pages

### Main Landing Page (`/`)
- Hero: "Tour Management Built for Musicians, by Musicians"
- Problem/solution narrative
- Feature highlights (top 5 modules)
- Demo CTA: "Try it free — no signup required"
- Testimonials (once available)
- Pricing tiers
- FAQ

### User Type Landing Pages
Each user type gets a dedicated landing page explaining benefits specific to them:

#### Tour Manager (`/for/tour-managers`)
- "Stop chasing spreadsheets. Start running tours."
- Benefits: digital advance sheets, auto-generated itineraries, financial oversight, team management
- Module highlights: Advance Sheets, Finances, Analytics, Documents
- CTA: Demo as Tour Manager

#### Band Members (`/for/musicians`)
- "Know your day. Know your money. Focus on the music."
- Benefits: daily schedule at a glance, personal finance tracking, merch sales, fan connection
- Module highlights: Show Day, Personal Finances, Merch, Community
- CTA: Demo as Band Member

#### Crew (`/for/crew`)
- "Every load-in detail. Every production spec. One app."
- Benefits: production info, schedules, documents, communication
- Module highlights: Show Day, Production Bible, Documents
- CTA: Demo as Crew

#### Venue Contacts (`/for/venues`)
- "Fill out one form. Never fax an advance sheet again."
- Benefits: simple web form, no login required, data saved for future shows
- Module highlights: Smart Advance Sheet
- CTA: Try the Venue Form

#### Fans (`/for/fans`)
- "Get closer to the music. Exclusive content, merch, and community."
- Benefits: exclusive content, merch store, community, show notifications
- Module highlights: Community, Merch Store, Events
- CTA: Join the Community

### Module Landing Pages (`/features/[module-slug]`)
- Each module has its own landing page
- What it does, screenshots, benefits, which user types it serves
- "How it works" 3-step visual
- CTA: Try in demo or sign up

---

## Updated Phase Roadmap

**Phase 1 (MVP 1):** Digital Advance Sheet + Auto-Generated Itinerary
**Phase 2:** User Settings, Light/Dark Mode, Timezone Support
**Phase 3:** Module System + Feature Gating + Per-Module Tutorials
**Phase 4:** Tour Money Tracker (expenses, P&L, per-member finances)
**Phase 5:** Show Day App (member daily companion, mobile-first)
**Phase 6:** Demo System (demo users, realistic data, single-button login)
**Phase 7:** Landing Pages (main, per user type, per module)
**Phase 8:** Merch Empire (inventory, sales, online store)
**Phase 9:** Fan Marketing Emails + Community
**Phase 10:** Family Tour Hub (polls, practice scheduling, shared albums)
**Phase 11:** Help System (RAG) + Feedback Tool
**Phase 12:** Admin Dashboard (analytics, metrics, logs, impact tracking)
**Phase 13:** Admin Education Tool + Academy/LMS
**Phase 14:** Musician Tax Platform (state-by-state, deductions)
**Phase 15:** Production Bible (stage plots, equipment, crew sheets)
**Phase 16:** Subscription Management + Stripe Billing
**Phase 17:** Public API + Webhook System
**Phase 18:** White Label System
**Phase 19:** Venue Network (crowd-sourced database)
**Phase 20:** Multi-Act Touring + Festival Mode
**Phase 21:** Wellness Platform

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) | Consistent with sibling projects |
| Database | Supabase (Postgres + Auth + Realtime + Storage) | RLS for multi-member access, Realtime for live schedule updates |
| Styling | Tailwind CSS 4 | Established pattern |
| Icons | Lucide React | Established pattern |
| Maps | Leaflet | Venue/hotel location display |
| Media | Cloudinary | Receipt photos, tour photos |
| Payments | Stripe | Merch sales |
| Rich Text | Tiptap | Tour notes, announcements |
| PDF Generation | @react-pdf/renderer | Itineraries, reports, advance sheets |
| CSV Parsing | Papa Parse | Client-side CSV import/export |
| Offline/PWA | next-pwa + IndexedDB (idb) | Offline itinerary viewing, expense entry, schedule access |
| Charts | Recharts | Admin analytics, financial dashboards |
| Email | Resend | Marketing emails, transactional notifications |
| AI/RAG | pgvector + OpenAI embeddings | Help system semantic search |
| API Docs | Swagger/OpenAPI | Public API documentation |
| Deployment | Vercel | Established pattern |

---

## Reference Files
- `Itinerarry Template 030211.jpg` - exact daily itinerary format to replicate
- `Copy of 7_26_6_2025 ADVANCE SHEET KANNAPOLIS NC VILLIAGE PARK SSS copy.xlsx` - exact advance sheet structure to digitize
- Sibling project patterns: `contractor-os/lib/supabase/`, `contractor-os/middleware.ts`, `contractor-os/app/layout.tsx`

---

## Verification Plan
1. Create advance sheet form and have a test "venue contact" fill it out
2. Verify auto-generated itinerary matches the JPG template format
3. Test printable itinerary output and PDF export
4. Verify Supabase RLS policies restrict data per tour member
5. Test realtime updates when advance sheet data changes
6. Mobile responsiveness testing for the member daily view
7. Module gating: disable a module, verify nav/pages/API are blocked for that member
8. Demo login: single-button login as each demo role, verify correct module access and realistic data
9. Landing pages: each user type page loads, links to correct demo, responsive
10. Timezone: set user to different timezone, verify all times convert correctly
11. Light/dark mode: toggle theme, verify all pages render correctly in both
12. CSV export: export expenses/contacts/shows, verify data integrity
13. Feedback tool: submit feedback as user, verify admin notification, respond in thread
14. Academy: complete a course, verify progress tracking
15. Admin dashboard: verify analytics populate from demo data
16. Offline: disconnect network, verify cached pages still load, queued changes sync on reconnect
17. ARIA: screen reader pass on key flows (advance sheet, daily view, settings)
