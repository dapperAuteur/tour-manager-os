# Tour Manager OS

A comprehensive tour management platform built for touring musicians and their teams. Replaces spreadsheets, printed itineraries, and fragmented tools with a single, offline-capable, mobile-first application.

## What It Does

Tour Manager OS digitizes the entire touring workflow:

- **Digital Advance Sheets** — Smart web forms that venues fill out online. No more emailing Excel files and chasing responses. Data flows directly into auto-generated daily itineraries.
- **Auto-Generated Itineraries** — Show day schedules, venue info, hotel details, transportation, and contacts — all assembled automatically from advance sheet data.
- **Tour Finances** — Real-time P&L per show and per tour. Per-member financial views, receipt capture, expense tracking, and tax-friendly exports.
- **Show Day Companion** — Mobile-first daily view for each member. Open your phone, see your whole day: soundcheck at 3, doors at 7, you're on at 9:15.
- **Merch Management** — Inventory tracking, per-show sales, and an online merch store with Stripe payments.
- **Fan Engagement** — Marketing emails, exclusive content, community forums, and public event pages.
- **Family Collaboration** — Polls, practice scheduling, shared albums, group chat, and days-off planning.
- **Document Hub** — Contracts, riders, W-9s, venue maps — all organized per tour and show.
- **Academy/LMS** — Courses teaching users how to get the most from every feature.
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
| Database | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Maps | Leaflet |
| Media | Cloudinary |
| Payments | Stripe |
| Rich Text | Tiptap |
| PDF Generation | @react-pdf/renderer |
| CSV Parsing | Papa Parse |
| Charts | Recharts |
| Email | Resend |
| AI/RAG Help | pgvector + Gemini embeddings |
| Offline/PWA | next-pwa + IndexedDB |
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
│   ├── (public)/           # Public pages (landing, login, demo)
│   ├── (auth)/             # Authenticated pages
│   │   ├── dashboard/      # Main dashboard
│   │   ├── tours/          # Tour management
│   │   ├── settings/       # User settings
│   │   ├── academy/        # LMS courses
│   │   ├── community/      # Fan community
│   │   ├── marketing/      # Email marketing
│   │   ├── feedback/       # Feedback threads
│   │   ├── help/           # RAG-powered help
│   │   └── admin/          # Admin dashboard
│   ├── advance/            # Public advance sheet forms (no auth)
│   └── api/                # API routes
│       └── v1/             # Public API
├── components/             # Shared React components
│   ├── ui/                 # Base UI components
│   ├── modules/            # Module-specific components
│   └── layout/             # Layout components
├── lib/                    # Shared utilities
│   ├── supabase/           # Supabase clients (client, server, admin)
│   ├── modules/            # Module access helpers
│   ├── offline/            # IndexedDB + sync utilities
│   └── pdf/                # PDF generation templates
├── supabase/               # Supabase config
│   ├── migrations/         # SQL migrations
│   └── seed.sql            # Demo data seed
├── public/                 # Static assets
├── plans/                  # Product plans and documentation
└── docs/                   # Developer documentation
```

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

## Documentation

- [Roadmap](ROADMAP.md) — Public roadmap with current status of all features
- [Product Plan](plans/tour-manager-os-plan.md) — Full product vision, MVPs, and phased roadmap
- [SWOT: Supabase vs MongoDB](plans/swot-supabase-vs-mongodb.md) — Database decision analysis
- [Contributing](CONTRIBUTING.md) — How to contribute
- [Code of Conduct](CODE_OF_CONDUCT.md) — Community standards
- [Style Guide](STYLE_GUIDE.md) — Code conventions and patterns
- [Code Rules](CODE_RULES.md) — Architectural rules and constraints

## License

Proprietary. All rights reserved.
# tour-manager-os
