-- ============================================================
-- ADMIN EDUCATION COURSE (closes audit recommendation #9)
-- 5 lessons covering Stripe, Mailgun, Supabase, Vercel, and the
-- codebase architecture — the four production dependencies and the
-- code itself. Designed for admins giving stakeholder presentations
-- or onboarding contributors.
-- ============================================================

insert into courses (
  id, title, slug, description, category, difficulty,
  estimated_minutes, sort_order, published
) values (
  '70000000-0000-0000-0000-000000000001',
  'Platform Internals for Admins',
  'admin-education',
  'A presentation-ready tour of the four production dependencies (Stripe, Mailgun, Supabase, Vercel) and the codebase itself. Use these lessons to onboard contributors or pitch the architecture to stakeholders.',
  'admin',
  'intermediate',
  60,
  100,
  true
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = now();

insert into lessons (
  id, course_id, title, slug, content, sort_order, published
) values
(
  '70000000-0000-0000-0000-000000000101',
  '70000000-0000-0000-0000-000000000001',
  'Stripe — Payments, Webhooks, and Tickets',
  'stripe',
  '## What Stripe does for us

Stripe handles every money-in path: subscription checkout, ticket purchases, and refund workflows. We never touch card numbers — Stripe Checkout owns the form and PCI scope.

## The flow

1. Client posts to a `/api/.../checkout` route (subscription or ticket).
2. Server validates inventory/eligibility, then calls `stripe.checkout.sessions.create({ ..., metadata: { kind, ... } })`.
3. User redirects to Stripe-hosted Checkout.
4. On payment, Stripe POSTs `checkout.session.completed` to `/api/stripe/webhook`.
5. The webhook dispatches on `metadata.kind`:
   - `kind === ''ticket''` → `issueTickets()` inserts N HMAC-signed ticket rows and emails QR links.
   - default → subscription path (insert subscription row, flip `org_members.is_paid`).
6. Refunds come back as `charge.refunded` → mark matching tickets as ''refunded'' and decrement `quantity_sold`.

## Anti-counterfeit (Phase 24)

Each ticket has an HMAC-SHA256 signature over `id|show_id|issued_at` keyed by `TICKET_SIGNING_SECRET`. The door scanner verifies via `timingSafeEqual` and an atomic `UPDATE … WHERE status=''issued''` so a second scan flips zero rows → "already used".

## Required env vars

- `STRIPE_SECRET_KEY` (server)
- `STRIPE_WEBHOOK_SECRET` (server, set per environment)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client)
- `TICKET_SIGNING_SECRET` (≥32 bytes)

## Operational notes

- Webhook is observability-instrumented via `lib/observability/logger.ts` — failures appear as `$exception` events in PostHog.
- Webhook is idempotent on `stripe_session_id`: a replay won''t double-issue tickets.
- Stripe Connect split payments are deferred (Phase 24.1).',
  1,
  true
),
(
  '70000000-0000-0000-0000-000000000102',
  '70000000-0000-0000-0000-000000000001',
  'Mailgun — Transactional Email and Webhooks',
  'mailgun',
  '## What Mailgun does for us

Mailgun is our outbound email provider, replacing Resend (commit `ba49ea7`). It powers ticket delivery, feedback notifications, marketing campaigns, and rejection emails for fan-photo moderation.

## How we use it

`lib/email/mailgun.ts` is a dependency-free direct-fetch client. The send shape:

```ts
await sendEmail({
  to, subject, html, tags,
  // from defaults to EMAIL_FROM env var
})
```

Region-aware via `MAILGUN_REGION` (`us` → `api.mailgun.net`, `eu` → `api.eu.mailgun.net`).

## Inbound webhooks

`/api/webhooks/mailgun` verifies Mailgun''s `signature.timestamp + signature.token` HMAC against `MAILGUN_API_KEY` with a 5-minute replay window. Handles:

- `delivered` / `opened` / `clicked` — no-ops (Phase 17 reads counters directly from PostHog/own tracking)
- `failed` with `severity = ''permanent''` → auto-unsubscribe
- `complained` / `unsubscribed` → auto-unsubscribe

## Required env vars

- `MAILGUN_API_KEY` (server)
- `MAILGUN_DOMAIN` (e.g. `mg.witus.online`)
- `MAILGUN_REGION` (us | eu)
- `EMAIL_FROM` (e.g. `Tour Manager OS <noreply@mg.witus.online>`)
- `ADMIN_NOTIFY_EMAIL` (server)

## DNS

Verify the sending domain (SPF, DKIM, MX) in the Mailgun dashboard before going live.',
  2,
  true
),
(
  '70000000-0000-0000-0000-000000000103',
  '70000000-0000-0000-0000-000000000001',
  'Supabase — Database, Auth, RLS, and Realtime',
  'supabase',
  '## What Supabase gives us

A managed Postgres with Auth, Row-Level Security, Realtime, and Storage. We run **everything** through Supabase — no other DB, no other auth.

## Three clients, three contexts

```
lib/supabase/client.ts   → browser, anon key
lib/supabase/server.ts   → Server Components / Server Actions; @supabase/ssr
                            with cookie forwarding (auth.uid() works)
lib/supabase/admin.ts    → service-role; bypasses RLS, server-only
```

Use the user-scoped server client by default so RLS enforces policies. Drop to the admin client only for:
- public anon access where RLS would over-filter (e.g. fetching approved fan photos for the wall)
- write paths during anonymous flows (e.g. advance-sheet submit, fan-photo upload after explicit eligibility check)
- cron / webhook handlers with no session

## RLS patterns we rely on

- `created_by = auth.uid()` on owner-bound rows (tours, fan_photos)
- `id IN (SELECT … FROM tour_members WHERE user_id = auth.uid())` for tour staff access (shows, tickets, scan_logs)
- `SECURITY DEFINER` helper functions for recursive cases (`get_user_tour_ids`, `can_post_photos_for_show`, `increment_ticket_sold`)
- A subtle gotcha: `INSERT … RETURNING` runs SELECT-RLS on the new row too. Migration `028_fix_tours_creator_select_rls.sql` adds a creator-can-read policy so RETURNING doesn''t 42501.

## Required env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server)
- `POSTGRES_URL_NON_POOLING` (server, for psql migrations)

## Migration workflow

All schema lives in `supabase/migrations/*.sql`. Apply against the remote DB with `psql "$POSTGRES_URL_NON_POOLING" -f path/to/file.sql`. Never edit a merged migration; add a new one.',
  3,
  true
),
(
  '70000000-0000-0000-0000-000000000104',
  '70000000-0000-0000-0000-000000000001',
  'Vercel — Deployment, Crons, and Observability',
  'vercel',
  '## What Vercel gives us

Hosting + CI/CD + cron jobs + observability for a Next.js 15 app with Node 20+ Fluid Compute. Default deploy target.

## Deploy flow

1. `git push origin main` → Vercel builds + deploys production.
2. Push to a non-main branch → preview deploy with its own URL.
3. PR comments include the preview link.

We don''t use Edge runtime — Fluid Compute Node is the default and supports the full Node API surface (HMAC crypto, posthog-node, etc.). No `export const runtime = ''edge''` anywhere in the codebase.

## Cron jobs

Configured in `vercel.json`:

```json
{ "crons": [{ "path": "/api/cron/reset-demo", "schedule": "0 0 * * *" }] }
```

Cron endpoints authenticate via `Authorization: Bearer $CRON_SECRET`. Production hits run with the Vercel-set secret automatically.

## Observability stack

- `console.log` / `console.error` → Vercel runtime logs (rolling window)
- `lib/observability/logger.ts` → mirrors to PostHog `$exception` events (queryable beyond rolling window)
- PostHog Analytics (client + server) — product events
- Vercel Speed Insights + Analytics — Core Web Vitals

## Required env vars

Add these in Vercel project settings for **Production + Preview + Development**:

- `NEXT_PUBLIC_SITE_URL`
- All `STRIPE_*`, `MAILGUN_*`, `CLOUDINARY_*`, `SUPABASE_*`, `POSTGRES_*` secrets
- `CRON_SECRET`
- `TICKET_SIGNING_SECRET`
- `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST`

## Rollback

Vercel Dashboard → Deployments → promote any prior production deploy in one click. No DB rollback unless a migration was destructive.',
  4,
  true
),
(
  '70000000-0000-0000-0000-000000000105',
  '70000000-0000-0000-0000-000000000001',
  'Codebase Tour — Routes, Modules, Conventions',
  'codebase',
  '## Stack

- Next.js 15 (App Router, Turbopack dev)
- React 19, Node 20+
- Tailwind CSS 4, Lucide icons
- TypeScript everywhere

## Directory map

```
app/(public)/            — public pages with no auth (landing, /shows/[id]/tickets, /shows/[id]/photos)
app/(auth)/              — authenticated routes (gated by middleware.ts)
app/tickets/[id]/        — ticket holder QR display (token or session auth)
app/photos/[id]/         — per-photo public share page (OG + Twitter Card)
app/advance/[token]/     — anonymous advance-sheet submit (token auth)
app/api/                 — route handlers (webhooks, tickets, fan-photos, v1 public API)
lib/supabase/            — client / server / admin
lib/tickets/             — HMAC signing
lib/cloudinary/          — server-signed uploads
lib/email/               — Mailgun client + send-campaign action
lib/weather/             — Open-Meteo client + cache
lib/observability/       — structured logger
lib/api/                 — public API auth, rate limit, scope helpers
supabase/migrations/     — all DDL
```

## Module system

Every major feature is a toggleable module:

- `modules` table holds the registry (key, name, tier, sort_order)
- `org_modules` toggles on/off per org
- `member_module_access` opts members in
- `lib/modules/feature-data.ts` is the source of truth for `/features/[slug]` landing pages

## Conventions to follow (per CLAUDE.md)

- **New feature branch per implementation step**, atomic commits, never merge to main yourself.
- Update **both** roadmaps (`ROADMAP.md` + `app/roadmap/page.tsx`) after every shipped feature.
- Update **docs** (`README.md`, in-app help/academy, `/developers`, style/code guides) after every task.
- Run migrations against the remote DB via psql.
- WCAG 2.1 AA, mobile-first, dark mode from day one.
- Escape apostrophes in JSX text (`&apos;`) — `react/no-unescaped-entities` is an error.

## Git workflow

After each commit, `git push -u origin <branch>` so the user can review/merge. When several related branches accumulate, optionally cut an `integration/...` branch to bundle them for combined review. Never merge into main yourself.

## Live status

`/roadmap` and `ROADMAP.md` are the source of truth for what''s shipped. `plans/01-status-audit-2026-05-09.md` has the most recent verified audit.',
  5,
  true
)
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = now();
