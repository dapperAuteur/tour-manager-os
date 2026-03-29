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

## Phase 5: Show Day App 📋
> Mobile-first daily companion for each band member.

- 📋 "Today" view (schedule, venue, hotel, weather, countdown)
- 📋 Swipe between days
- 📋 "Next up" widget
- 📋 Push notifications for schedule changes
- 📋 Tap-to-navigate (venue/hotel addresses open in maps)
- 📋 Tap-to-call (phone numbers)

## Phase 6: Demo System 📋
> Pre-configured demo accounts with realistic data for try-before-you-buy.

- 📋 Demo users (Tour Manager, Band Member, Crew, Venue Contact, Fan)
- 📋 Single-button demo login (no email/password)
- 📋 Realistic seed data ("The Roadwell Family" — tours, shows, finances, merch)
- 📋 Demo banner with signup CTA
- 📋 Daily data reset

## Phase 7: Landing Pages 📋
> Dedicated pages per user type and per module with demo login buttons.

- 📋 Main landing page (hero, features, pricing, FAQ)
- 📋 Per user type (/for/tour-managers, /for/musicians, /for/crew, /for/venues, /for/fans)
- 📋 Per module feature pages (/features/[slug]) with screenshots and benefits
- 📋 "Try as demo" button on each page

## Phase 8: Merch Empire 📋
> Inventory tracking, per-show sales, online merch store.

- 📋 Merch inventory management (SKUs, quantities, cost basis)
- 📋 Per-show merch sales tracking
- 📋 Online merch store (Stripe payments)
- 📋 Tour-exclusive merch drops
- 📋 Merch P&L separate from show P&L

## Phase 9: Fan Marketing & Community 📋
> Email marketing, exclusive content, community forums.

- 📋 Fan email list management with segments
- 📋 Email campaign builder and scheduling
- 📋 Community discussion boards
- 📋 Public event pages per show
- 📋 Pre/post-show exclusive content

## Phase 10: Family Tour Hub 📋
> Polls, practice scheduling, shared albums, group collaboration.

- 📋 Family polls for group decisions
- 📋 Practice room scheduling
- 📋 Setlist collaboration
- 📋 Shared photo/video albums per tour
- 📋 Days-off planner with local suggestions

## Phase 11: Help & Feedback 📋
> RAG-powered help, conversational feedback system.

- 📋 AI help assistant (Gemini + pgvector)
- 📋 Conversational feedback threads
- 📋 Admin notification on new feedback
- 📋 In-thread admin responses

## Phase 12: Admin Dashboard 📋
> Analytics, metrics, logs, user impact tracking.

- 📋 User engagement metrics (DAU/WAU/MAU, session duration)
- 📋 Tour metrics (tours created, shows managed, advance sheets)
- 📋 Financial metrics (revenue tracked, expenses logged)
- 📋 Module adoption rates
- 📋 Activity logs
- 📋 User impact dashboard (for presentations)

## Phase 13: Academy / LMS 📋
> Courses teaching users how to use the platform.

- 📋 Course and lesson management
- 📋 Rich text + video lessons
- 📋 Quizzes and progress tracking
- 📋 Certificates of completion
- 📋 Admin education tool (codebase/architecture reference)

## Phase 14: Musician Tax Platform 💡
> State-by-state tax tracking, deductions, year-end packages.

- 💡 Per diem tracking against IRS guidelines
- 💡 State-by-state tax liability calculator
- 💡 QuickBooks/Xero integration
- 💡 Year-end tax package generation

## Phase 15: Production Bible 💡
> Stage plots, equipment inventory, crew call sheets.

- 💡 Drag-and-drop stage plot builder
- 💡 Equipment inventory tracking
- 💡 Auto-generated crew call sheets
- 💡 Rider compliance checklists
- 💡 Historical production notes per venue

## Phase 16: Subscriptions & Billing 💡
> Stripe-powered annual subscriptions (Free/Pro/Enterprise).

- 💡 Subscription tier management
- 💡 Stripe recurring billing
- 💡 Usage limits per tier
- 💡 Upgrade/downgrade flows

## Phase 17: Public API 💡
> RESTful API for third-party integrations.

- 💡 API key authentication
- 💡 Rate limiting per tier
- 💡 OpenAPI/Swagger docs
- 💡 Webhook support

## Phase 18: White Label 💡
> Branded versions for other bands/organizations.

- 💡 Custom logo, colors, fonts, domain
- 💡 Multi-tenant architecture
- 💡 Master admin dashboard

## Phase 19: Venue Network 💡
> Crowd-sourced venue database, smart advance pre-fill.

- 💡 Venue profiles with ratings and photos
- 💡 Smart advance (pre-fill from past data)
- 💡 Venue search and discovery

## Phase 20: Multi-Act Touring 💡
> Festival mode, cross-act coordination.

- 💡 Multi-act schedule coordination
- 💡 Shared production timelines
- 💡 Festival mode (multiple stages/days)

## Phase 21: Wellness Platform 💡
> Health and wellbeing tools for life on the road.

- 💡 Sleep tracking relative to timezone changes
- 💡 Vocal/physical warmup reminders
- 💡 Mood/energy tracking
- 💡 Burnout detection

---

## How to Request Features

Use the in-app feedback tool (coming in Phase 11) or open an issue on GitHub.
