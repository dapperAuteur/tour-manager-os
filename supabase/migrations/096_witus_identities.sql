-- ============================================================
-- WITUS IDENTITIES
-- Maps a WitUS account (the OIDC `sub` from accounts.witus.online)
-- to a Tour Manager OS Supabase user. "Sign in with WitUS"
-- (app/api/auth/witus/callback) signs in the Tour user whose email
-- matches the IdP-verified email (creating one if none exists),
-- then records the link here. Same table as CentenarianOS's
-- 20260630120000_witus_identities.sql; Tour has its own Supabase
-- project, so it needs its own copy.
--
-- Idempotent: safe to run twice. Apply by hand (psql or the SQL
-- editor); this project has no migration history table, so never
-- `supabase db push` it (plans/user-tasks/52).
-- ============================================================

create table if not exists public.witus_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  witus_sub text not null unique,
  created_at timestamptz not null default now()
);

-- RLS on with no policies: only the service-role server (which
-- bypasses RLS) reads or writes it. No client ever needs this table.
alter table public.witus_identities enable row level security;
