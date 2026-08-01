# Tour Manager OS

A comprehensive tour management platform built for touring musicians and their teams. Replaces spreadsheets, printed itineraries, and fragmented tools with a single, offline-capable, mobile-first application.

## What It Does

Tour Manager OS digitizes the entire touring workflow:

- **Digital Advance Sheets** — Smart web forms that venues fill out online. No more emailing Excel files and chasing responses. Data flows directly into auto-generated daily itineraries.
- **Auto-Generated Itineraries** — Show day schedules, venue info, hotel details, transportation, and contacts — all assembled automatically from advance sheet data.
- **Tour Finances** — Real-time P&L per show and per tour. Per-member financial views, expense tracking, expense cost splitting with settle tracking, tax-friendly CSV exports, QuickBooks/Xero accounting export, and one-page settlement PDF (revenue, expenses, net, splits, Stripe transfers).
- **Show Day Companion** — Mobile-first daily view for each member. Open your phone, see your whole day: soundcheck at 3, doors at 7, you're on at 9:15.
- **Ticketing System** — Public buy page with Stripe Checkout, HMAC-signed QR codes (anti-counterfeit), web-based door scanner with atomic single-use enforcement, offline scanner cache, refund handling, Apple Wallet and Google Wallet pass delivery, Stripe Connect transfer payouts, and a manager dashboard for sales/admission stats.
- **Fan Photo Sharing** — Ticket-holders submit show photos to a pre-moderated public wall. Each approved photo gets its own sharable page with Open Graph + Twitter Card metadata.
- **Merch Management** — Inventory tracking, per-show sales, and merch P&L. Online store with Stripe payments planned.
- **Fan Engagement** — Marketing email campaigns via Mailgun, or via the band's own Gmail through OAuth send-as (campaigns land in the band's Sent folder, replies route to the band's inbox). Open/click tracking, bounce/complaint webhooks, community forums with pin/lock moderation, per-show event pages, live show streaming (Viloud embed with a Go Live toggle), and WanderLearn 360 virtual-tour embeds per show.
- **Family Collaboration** — Polls, practice scheduling, shared albums, setlist collaboration.
- **Document Hub** — Contracts, riders, W-9s, venue maps — organized per tour and show.
- **Venue Network** — Crowd-sourced public venue directory with ratings, fuzzy search, auto-creation from submitted advance sheets, multiple contacts per venue, multi-stage/space support (indoor/outdoor/tent), photos, a Leaflet map view, and attachable tech-pack files (sound/lights/video/stage-plot PDFs and docs).
- **Multi-Act Touring** — Tour packages with multiple acts, shared production timelines.
- **Wellness Platform** — Daily wellness log, warmup routines, family check-ins, CentenarianOS integration.
- **Academy/LMS** — Courses + lessons + quizzes teaching users how to use the platform.
- **Public API** — RESTful endpoints (tours, shows, itineraries) with key management, request logging, and developer docs.
- **White Label** — Custom branding, fonts, and domains for enterprise clients.
- **Admin Dashboard** — Analytics, metrics, feedback management, and user impact tracking.

## Key Principles

- **Offline First** — Works in areas with unreliable internet. PWA with IndexedDB caching and background sync.
- **Accessible** — WCAG 2.1 AA compliant. Semantic HTML, ARIA labels, keyboard navigation, screen reader support.
- **Mobile First** — Designed for phones first, then scaled up. Touch targets, responsive layouts, swipe gestures.
- **Modular** — Every feature is a toggleable module. Users opt in to what they need, avoiding overwhelm.
- **Light/Dark Mode** — Full theme support with system preference detection and manual toggle.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| React | 19 |
| Node | 20+ (pinned via `engines.node`) |
| Database | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Media | Cloudinary (server-signed uploads) |
| Payments | Stripe (Checkout sessions + webhooks for tickets and subscriptions) |
| QR Codes | qrcode.react (display) + @zxing/browser (scanner) |
| Email | Mailgun (platform fallback) + Gmail API send-as (per-user OAuth) |
| Wallet passes | Apple Wallet (passkit-generator + PKPASS_* certs) + Google Wallet (Save-to-Wallet JWT, RS256) |
| PDF | pdf-lib (tour settlement report, completion certificates) |
| AI | Vercel AI Gateway via AI SDK v6 (Mistral / Cerebras / Together / OpenRouter) |
| Vector | pgvector on Supabase (HNSW cosine, 1024-dim Mistral embeddings) |
| AI observability | LangSmith (traceable wrapper on embed / chat / vision calls) |
| Analytics | PostHog + Vercel Speed Insights + Vercel Analytics |
| Error monitoring | Better Stack via the `@sentry/nextjs` SDK (server + edge + browser). Inert until `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` are set; a `beforeSend` scrubber strips advance tokens, auth codes, JWTs, API keys, and emails before anything leaves the process |
| Tests | Vitest (`npm test`), node environment, unit tests for pure logic |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account (or local Supabase via Docker)
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd tour-manager-os

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and service credentials

# Run Supabase migrations
npx supabase db push

# Seed demo data
npx supabase db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Demo Access

The app ships with pre-configured demo accounts. From the landing page, click "Try Demo" and select a role:

| Role | What You See |
|------|-------------|
| Tour Manager | All modules — full admin experience |
| Band Member | Show Day, Finances, Merch, Community |
| Crew Member | Show Day, Production, Documents |
| Venue Contact | Advance Sheet form (their show only) |
| Fan | Community, Events, Merch Store |

Demo data features "The Roadwell Family" — a 5-member family band with completed tours, financial history, merch inventory, and an active community.

## Project Structure

```
tour-manager-os/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public pages (landing, /shows/[id]/tickets, /shows/[id]/photos)
│   ├── (auth)/             # Authenticated pages
│   │   ├── today/          # Show Day mobile view
│   │   ├── tours/          # Tour management
│   │   │   └── [id]/shows/[showId]/   # Show detail, scanner, ticketing dashboard, fan-photos moderation
│   │   ├── photos/         # Fan's own photo submissions dashboard
│   │   ├── settings/       # User settings
│   │   ├── academy/        # LMS courses + lessons + quizzes
│   │   ├── community/      # Fan community (pin/lock moderation)
│   │   ├── marketing/      # Email marketing campaigns
│   │   ├── feedback/       # Feedback threads
│   │   ├── help/           # Searchable help articles
│   │   ├── developers/     # Public API docs
│   │   └── admin/          # Admin dashboard
│   ├── advance/            # Public advance sheet forms (no auth, token-based)
│   ├── tickets/[id]/       # Holder QR display + success page
│   ├── photos/[id]/        # Per-photo public share page (OG + Twitter Card)
│   ├── features/[slug]/    # Auto-generated module landing pages
│   ├── for/                # Per-user-type landing pages
│   └── api/                # API routes
│       ├── tickets/        # Checkout, fetch, scan
│       ├── fan-photos/     # Upload
│       ├── admin/fan-photos/ # Moderation queue + moderate
│       ├── webhooks/       # Stripe, Mailgun
│       └── v1/             # Public API (tours, shows, itineraries)
├── components/             # Shared React components
├── lib/                    # Shared utilities
│   ├── supabase/           # Supabase clients (client.ts, server.ts, admin.ts)
│   ├── tickets/            # HMAC signing helpers
│   ├── cloudinary/         # Server-signed upload helper
│   ├── email/              # Mailgun client + send-campaign action
│   ├── observability/      # Structured logger + Sentry PII scrubber (+ its unit test)
│   ├── auth/               # public-paths.ts: which paths a signed-out visitor may reach
│   └── modules/            # Module registry + feature page data
├── middleware.ts           # Tenant resolution + the signed-out login redirect
├── instrumentation.ts      # Runtime hook: loads error monitoring, tags the tenant host
├── instrumentation-client.ts # Browser error monitoring init
├── sentry.server.config.ts # Node runtime init (DSN-guarded)
├── sentry.edge.config.ts   # Edge/middleware runtime init (DSN-guarded)
├── supabase/
│   └── migrations/         # SQL migrations (run via psql against remote)
├── plans/                  # Internal product plans (gitignored)
└── public/                 # Static assets
```

## Authentication and route protection

Three layers, in the order a request meets them:

1. **`middleware.ts`** redirects a signed-out visitor to `/login?redirect=<path>`. What counts as
   public is `lib/auth/public-paths.ts`: an exact list (`/`, `/login`, `/signup`, `/pricing`,
   `/roadmap`, `/features`, `/wellness-resources`, plus `/robots.txt`, `/sitemap.xml`, `/sw.js`)
   and a prefix list (`/auth/callback`, `/advance/`, `/for/`, `/features/`, `/shows/`, `/store/`,
   `/photos/`, `/tickets/`). Exact and prefix are separate lists on purpose: a single list matched
   with `startsWith` made `/` a prefix of every path, and this redirect never ran.
2. **`app/(auth)/layout.tsx`** calls `supabase.auth.getUser()` and redirects to `/login` when there
   is no session. Every page in that route group inherits it, so it is the real gate for the app,
   and the middleware is defence in depth in front of it.
3. **Route handlers gate themselves.** Middleware never redirects `/api/*`, because a 302 to an HTML form
   is useless to a webhook or an API client. Each handler under `app/api` does its own check
   (session + 401, `Authorization: Bearer tmos_...` API key, Stripe/Mailgun signature, or
   `CRON_SECRET`) or is anonymous by design (public storefront checkout, ticket-token wallet
   passes, `/api/health`).

Row-level security in Postgres is the backstop under all three: an authenticated request that
reaches data it does not own returns zero rows.

## Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run test         # Run tests
npm run db:push      # Push Supabase migrations
npm run db:seed      # Seed demo data
npm run db:reset     # Reset database and re-seed
npm run db:types     # Generate TypeScript types from Supabase schema
```

## Health Check

`GET /api/health` is the endpoint uptime monitors should watch. **Point Better Stack at
`https://tour.witus.online/api/health`, not at `/`.** The homepage can serve a cached 200 while
Postgres is unreachable, so a green check on `/` proves only that the CDN is awake. This route runs
a real database query on every request, is never cached (`force-dynamic` plus `Cache-Control:
no-store`), and answers `HEAD` as well as `GET`.

| State | Status | Body |
| --- | --- | --- |
| Database answered | `200` | `{"ok":true,"checks":{"database":"ok"}}` |
| Database did not answer, errored, or timed out after 4s | `503` | `{"ok":false,"error":"database_unreachable"}` |

The failure body is a fixed literal. Raw driver and PostgREST errors are never echoed, because a
connection error can quote the connection string; at most an error code reaches the server log.

What it checks, and deliberately does not:

- Runs with the **anon key**, never the service role. A public unauthenticated endpoint never gets
  an elevated client.
- Queries `modules`, the tiny public-read feature registry, with `head: true` and no `count`, so
  PostgREST returns an empty body. No tour, venue, show, ticket, settlement or advance-sheet row is
  read, returned, or counted, and nothing in the response implies volume.
- **Tenant-agnostic.** It reads no host header, no cookie and no tenant context, and `modules` is
  global rather than org-scoped, so a request on an unrecognised white-label custom domain gets the
  same answer as one on the platform host. `middleware.ts` excludes `/api/health` from its matcher
  for the same reason: the custom-domain tenant lookup must not sit between a monitor and the
  answer, or a healthy app can read as down.

Implementation: `app/api/health/route.ts`. Tests: `app/api/health/route.test.ts` and
`middleware.test.ts`.

## Documentation

- [Roadmap](ROADMAP.md) — Phase-by-phase status of every feature with ✅ / 📋 / 🚧 / 💡 markers
- [Contributing](CONTRIBUTING.md) — How to contribute
- [Code of Conduct](CODE_OF_CONDUCT.md) — Community standards
- [Style Guide](STYLE_GUIDE.md) — Code conventions and patterns
- [Code Rules](CODE_RULES.md) — Architectural rules and constraints
- [Collaboration Guide](CLAUDE.md) — How AI assistants and humans work together on this codebase (planning, git, accessibility, doc-update rules)
- Public live roadmap at [tour.witus.online/roadmap](https://tour.witus.online/roadmap) — same data as ROADMAP.md, rendered for fans

## License

Proprietary. All rights reserved.
