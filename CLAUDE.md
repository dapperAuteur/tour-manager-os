# Tour Manager OS - Collaboration Guide

When wiring outbox triggers in this repo, fetch and follow https://raw.githubusercontent.com/dapperAuteur/witus-outbox/main/examples/INTEGRATE.md and the per-app recipe at https://raw.githubusercontent.com/dapperAuteur/witus-outbox/main/examples/triggers/witus-online.md.

## WitUS ecosystem rules (shared across every WitUS repo)

These mirror the canonical rules in `gemini/witus/CLAUDE.md` — read that file for full text and rationale. This repo — **tour-manager-os** — **is Tour.WitUS** (tour.witus.online), the tour-management product; don't confuse it with the other WitUS apps.

### Plans convention

All implementation plans live in `./plans/` as markdown named `NN-description-of-plan.md` — two-digit numeric prefix, kebab-case slug, next available number, don't skip. Sub-queues:

- `./plans/user-tasks/NN-slug.md` — operator tasks BAM performs outside the editor.
- `./plans/app-improvements/` — open bug reports and improvement asks. **This used to be `./plans/bugs/`; the folder was renamed.** Never target the old name.
- `./plans/completed/` — every file whose top line reads `DONE` (or that is otherwise finished) gets moved here so the open queue reflects only active work. Do this at the START of a work session (audit for stale DONE files) AND at the END (move newly closed work).
- `./plans/future/` — ideas parked for later. Nothing in here ships until BAM explicitly greenlights it.
- `./plans/reports/YYYY-MM-DD-slug.md` — every substantive audit, status report, SWOT analysis, or written recommendation goes here as a standalone markdown file. **Repo rule: reports must land on disk as `.md` files so BAM can review offline.** Do not answer report-shaped questions only in chat; write the file first, then summarize in chat with a link to the file.

## How We Work Together

This is a living document. We add to it as we go so I don't repeat instructions.

### Communication Style
- Go straight to the point. No filler.
- Show ideas and options rather than asking permission for every small decision.
- When presenting options, be opinionated — say which you recommend and why.
- **Confirm the plan before running substantive work.** For anything larger than a one-file edit, one migration, or a trivial fix — state the plan in two or three lines and get a "go" from BAM before executing. Bias toward asking when scope, cost, or destination is ambiguous. Do NOT ask before trivial edits or read-only research.

### Planning & Process
- Plans go in `./plans/` as markdown named `NN-description-of-plan.md` (see WitUS ecosystem rules → Plans convention).
- Review this document (CLAUDE.md) after every set of instructions before starting work.
- **Check `ROADMAP.md` before coding** to understand current status and what phase we're in.
- **Update BOTH roadmaps after every shipped feature** so the public-facing version never drifts from reality:
  1. `ROADMAP.md` (repo root) — internal source of truth; mark items ✅ / 📋 / 🚧 / 💡, update "Last updated" date, add a phase entry for any new phase.
  2. `app/roadmap/page.tsx` (`/roadmap` web page) — the public-visible version users browse; add/update the matching entry in the `phases` array with `done: true/false` items.
  Both must stay aligned on phase number, name, and status of each item. If a claim turns out to be inaccurate (e.g. package not installed, function not wired), downgrade to 📋 immediately with a one-line reason — never leave aspirational ✅ entries.
- **Update the docs after every completed task** so contributors and end-users see current reality, not aspirations. After each task that changes a user-facing flow, tech-stack choice, env var, or developer workflow, audit and refresh:
  1. `README.md` — tech stack table, "What It Does" feature list, env-var examples, project structure, prerequisites, scripts. Anything stale = update or remove.
  2. `app/(auth)/help/` content (help_articles table seeded via SQL migration) — if a new module or major flow shipped, add or revise an article so users have an instruction page.
  3. `app/(auth)/academy/` lessons (courses + lessons + lesson_quizzes tables) — for substantial features, add an Academy lesson that teaches the flow end-to-end.
  4. `app/(auth)/developers/` page (Phase 18 API docs) — when a public API endpoint changes shape or a new one ships.
  5. `STYLE_GUIDE.md` / `CODE_RULES.md` / `CONTRIBUTING.md` — when conventions, tech choices, or contribution flows change.
  Default to the smallest update that closes the drift. If a doc is now wholly wrong, fix the prose; if a one-line addition suffices, just add the line. Cite the new module/route/file path so the reader can find the implementation.
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

### Git Workflow — Branch hygiene (BAM merges, between sessions by default)

Standard branch-hygiene (Halves 1–3, commit-often, and the `.githooks/pre-commit` guard) lives in the managed block below and `gemini/witus/CLAUDE.md` §"Branch-hygiene rule". Tour-manager-os adds one repo-specific rule on top:

**Half 4 — one clean bundle at handoff (added 2026-07-02).** The bundle Claude hands off MUST be conflict-free at push time. Do NOT hand off a bundle whose tip contains `<<<<<<<` markers, whose `npx tsc --noEmit` fails, or whose `npx next lint` shows NEW errors introduced by the bundle. Discipline that makes this work:

- Every feature branch is cut from freshly-fetched `origin/main`, not a stale local `main`.
- Additions to shared files (`ROADMAP.md`, `app/roadmap/page.tsx`, `README.md`, `lib/admin/unfinished-tracker.ts`, `plans/user-tasks/00-descriptions.md`) go at the END of their section — append, do not insert mid-list.
- When a bundle merge hits a conflict on `RECENTLY_SHIPPED` or the roadmap phase-block, the correct resolution is the UNION of both changes (keep every branch's entry). Never delete either side.
- Full workflow: `plans/reports/2026-07-02-single-bundle-no-conflicts-rule.md`.

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

---

<!-- BEGIN:witus-shared-rules v1 -->
<!-- MANAGED BLOCK — do not edit by hand. Source: gemini/witus/docs/shared-rules.md.
     Update the source, then run `node scripts/sync-claude-rules.mjs` in the witus repo. -->

## ⚠️ Ecosystem identity (shared note — don't confuse repos)

Full ecosystem identity + the canonical product index live in `gemini/witus/CLAUDE.md` and
`gemini/witus/lib/products.ts`. Each repo states *which* product it is in its own hand-owned line
above this managed block; don't infer another app's URLs, routes, IDs, env names, or DB schema —
confirm against that app's own code.

The site **brandanthonymcdonald.com** (BAM's personal portfolio) lives in `claude/bam-landing-page/`
— **NOT** `projects/bam-portfolio/` (the retired legacy static site). Target `bam-landing-page`.

## Operator-task rule — capture user actions in `./plans/user-tasks/`

When Claude proposes work that needs BAM to do something outside the editor (account signup, API
key, DNS change, vendor dashboard, env-var rotation, secret generation, PR review/merge, etc.),
Claude MUST create a `./plans/user-tasks/NN-slug.md` file in this repo. **No exceptions for "small"
steps.** Required sections: **Scope tag** · **What + why** (with explicit *what this blocks* detail
and any hard deadline) · **Steps** · **What Claude will use** · **How to mark done** · **Related**.
Keep `./plans/user-tasks/00-descriptions.md` updated with columns `# | Title | Scope | Blocks |
Status` — the `Blocks` column is the one BAM scans. Ecosystem-wide tasks (Keap, IRL events, retros,
cross-product decisions) live in the canonical witus queue at `gemini/witus/plans/user-tasks/`;
repo-local tasks live here. Read the witus queue at session start before dependent work. Full rule:
`gemini/witus/CLAUDE.md` §"Operator-task rule".

## Branch hygiene — BAM merges, between sessions by default

**Half 1.** Branch → commit → push → stop. Claude does not run `git checkout main && git merge`.
Never `--force` to shared branches. Before every commit run `git branch --show-current`; if it is
`main`/`master`, branch first (`feat/ fix/ chore/ docs/`). After push, hand back the branch name +
summary and stop.

**Half 2.** BAM merges pushed branches via the GitHub UI between sessions. Mid-session, after a
push, BAM may merge in a separate window and the local checkout silently fast-forwards to `main` —
so re-check `git branch --show-current` before **every** commit, not just at branch creation, or you
risk landing follow-up commits directly on `main`.

**Half 3.** Keep branches small (one concern each). When a session produces multiple branches,
consolidate them into one `bundle/<slug>-YYYY-MM-DD` via `git merge --no-ff` (preserves per-concern
history — no squash), resolve conflicts during bundling, run `tsc + lint + build` against the
bundle, push, and file ONE `./plans/user-tasks/NN-merge-bundle-<slug>.md`. BAM does one merge, not N.

**Commit often.** Commit at every working checkpoint — a passing build, a finished sub-step, a green
test — not just at the end. A usage-limit cutoff, a dropped connection, or a crashed session must
never lose more than the last few minutes of work. Small frequent commits on the feature branch keep
the branch un-merged (Half 1 still holds) and give BAM clean per-step history to drill into.

A checked-in `.githooks/pre-commit` guard refuses commits made directly on `main`/`master`. Activate
once per clone: `git config core.hooksPath .githooks`. Full rule: `gemini/witus/CLAUDE.md`
§"Branch-hygiene rule".

## Docs-sync rule — a change isn't done until its docs are current

When a change adds, alters, or removes a user-visible feature/route/scope, update the affected docs
**in the same branch**: README (feature list, env examples, scripts), in-app help/tutorial content,
`ROADMAP.md` **and** any public roadmap page, API/OpenAPI docs, and STYLE_GUIDE/CONTRIBUTING when a
convention changed. State which docs you touched in the handoff. Never leave an aspirational ✅ on a
roadmap — downgrade it with a one-line reason. If a doc update is genuinely out of scope, file it as
a `./plans/` task rather than skipping silently. A Stop hook in `.claude/settings.json` gates on
this: if the session diff changed feature/route files but touched no docs, it blocks once and asks
you to update-or-defer. Schema-only migrations, refactors, perf, and dev-tooling changes don't
trigger it.

## Plans convention

All implementation plans live in `./plans/` as `NN-description-of-plan.md` (two-digit prefix,
kebab-case, next available number, don't skip). Sub-queues: `./plans/user-tasks/NN-slug.md`
(operator tasks), `./plans/bugs/`, `./plans/future/`. (`plans/` is typically gitignored.)

## Citation rule

Anything publishable, teachable, or partner-facing (curriculum, teaching-oriented help articles,
white papers, grant/sponsor/partner writing) uses APA 7 in-line citations with a `## References`
section. Code docs, internal notes, and `plans/user-tasks/*` are out of scope. Full rule:
`gemini/witus/CLAUDE.md` §"Citation rule".

## Authoritative-values rule — never assert guessed external values

When a value is owned by an external system (DNS/registrar, a host like Vercel, a third-party API,
or another ecosystem app's URLs/routes/IDs/env/schema), read it from the authoritative source; don't
hardcode a guessed default and present it as correct. If you must ship a fallback, label it as a
fallback in both UI copy and a code comment. Verify by behavior (does the flow work?), not by
exact-match against a guess. When unsure, flag or ask — never assert. Full rule:
`gemini/witus/CLAUDE.md` §"Authoritative-values rule".

## Coding conventions

UI/UX/DX conventions (a11y, component patterns, TypeScript, microcopy, git-commit vocabulary, the
default Neon+Drizzle+pnpm+Vitest stack) are consolidated in `gemini/witus/docs/shared-ui-ux-dx.md`.
Read it before writing UI or API code. Two repos are grandfathered on Supabase+Jest and documented
there as exceptions.

<!-- END:witus-shared-rules v1 -->
