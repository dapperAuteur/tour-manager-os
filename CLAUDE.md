# Tour Manager OS - Collaboration Guide

When wiring outbox triggers in this repo, fetch and follow https://raw.githubusercontent.com/dapperAuteur/witus-outbox/main/examples/INTEGRATE.md and the per-app recipe at https://raw.githubusercontent.com/dapperAuteur/witus-outbox/main/examples/triggers/witus-online.md.

## How We Work Together

This is a living document. We add to it as we go so I don't repeat instructions.

### Communication Style
- Go straight to the point. No filler.
- Show ideas and options rather than asking permission for every small decision.
- When presenting options, be opinionated — say which you recommend and why.

### Planning & Process
- Plans go in `./plans/` directory as markdown files.
- Review this document (CLAUDE.md) after every set of instructions before starting work.
- **Check `ROADMAP.md` before coding** to understand current status and what phase we're in.
- **Update BOTH roadmaps after every shipped feature** so the public-facing version never drifts from reality:
  1. `ROADMAP.md` (repo root) — internal source of truth; mark items ✅ / 📋 / 🚧 / 💡, update "Last updated" date, add a phase entry for any new phase.
  2. `app/roadmap/page.tsx` (`/roadmap` web page) — the public-visible version users browse; add/update the matching entry in the `phases` array with `done: true/false` items.
  Both must stay aligned on phase number, name, and status of each item. If a claim turns out to be inaccurate (e.g. package not installed, function not wired), downgrade to 📋 immediately with a one-line reason — never leave aspirational ✅ entries.
- When the user says "discuss", present ideas with tradeoffs before building anything.

### Code & Architecture Patterns
- Follow patterns from sibling projects in `/Users/bam/Code_NOiCloud/ai-builds/gemini/` and `/Users/bam/Code_NOiCloud/ai-builds/claude/`
- Tech stack: Next.js 15 (App Router), Supabase (Postgres + Auth + RLS + Realtime), Tailwind CSS 4, Lucide React, Vercel deployment
- Supabase client pattern: `/lib/supabase/client.ts`, `/lib/supabase/server.ts`, `/lib/supabase/admin.ts`
- **Run all database migrations** against the remote Supabase instance after creating them (via psql)

### Accessibility & UX Requirements
- ARIA compliant / WCAG 2.1 AA - semantic HTML, proper ARIA labels, keyboard nav, screen reader support, focus management, color contrast
- Light/dark mode from day one (Tailwind `dark:` + system preference detection + manual toggle)
- Mobile first design - touch targets, responsive layouts, swipe gestures
- Offline mode for as many features as possible - PWA with service workers, IndexedDB caching, background sync. They tour places with unreliable internet.

### Git Workflow
- New feature branch for each implementation step
- Small incremental commits - atomic changes so user can confirm no bugs introduced
- Clear commit messages with each step
- Pause for user review after each step before proceeding
- **NEVER merge feature branches into main** - user handles all merges themselves

### Module System
- Every major feature is a toggleable module (admin enables for org, members opt-in)
- All pages/nav/API routes must check module access before rendering
- Each module has a short tutorial (3-5 steps) shown on first access
- Middleware pattern: check `org_modules` + `member_module_access` tables

### Demo & Landing Pages
- Demo users exist for each role (manager, member, crew, venue, fan) with realistic pre-seeded data
- Single-button demo login (no email/password required)
- Landing pages per user type and per module
- Demo data resets periodically

### Admin Features
- Admin dashboard: analytics, metrics, logs, user impact tracking
- Feedback tool: conversational threads between users and admin with notifications
- Admin education tool: codebase/architecture reference for presentations
- Academy/LMS: courses and lessons with progress tracking

### What to Avoid
- Never merge feature branches into main — user handles all merges
- `plans/future/ideas-to-discuss-later.md` is a scratchpad — do NOT add items from it to the plan or implement them unless the user explicitly asks

### What Works Well
- (We'll add to this as we go)

### Project Context
- Building a custom tour management platform for a family of touring musicians
- They currently use Excel advance sheets, printed itinerary templates, and Eventric Master Tour
- The goal is to consolidate everything into one custom tool with module system, white labeling, public API, and SaaS monetization
- Reference docs are in the project root (xlsx advance sheet, jpg itinerary template)
- Full plan: `./plans/tour-manager-os-plan.md`
- Database decision: `./plans/swot-supabase-vs-mongodb.md`
