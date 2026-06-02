-- ============================================================
-- STRIPE CONNECT SPLIT PAYMENTS — schema scaffolding
-- Phase 24.1
-- Stores the per-org Stripe Connect account + per-tour revenue
-- split allocations. The actual Stripe Transfer execution is wired
-- in a follow-up; this migration makes the bookkeeping side
-- queryable so admins can configure splits today and the platform
-- can payout against them when Connect is fully enabled in
-- production.
-- ============================================================

create table if not exists stripe_connected_accounts (
  org_id uuid primary key references organizations(id) on delete cascade,
  stripe_account_id text not null,
  charges_enabled boolean default false,
  payouts_enabled boolean default false,
  onboarding_complete boolean default false,
  /** Country code of the connected account (e.g. 'US'). */
  country text,
  /** Last time we successfully refreshed status from Stripe. */
  last_status_refresh_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists stripe_connected_accounts_stripe_id_idx
  on stripe_connected_accounts(stripe_account_id);

alter table stripe_connected_accounts enable row level security;

create policy "stripe_connected_accounts_org_select"
  on stripe_connected_accounts for select
  using (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );

create policy "stripe_connected_accounts_owner_manage"
  on stripe_connected_accounts for all
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  )
  with check (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create or replace trigger stripe_connected_accounts_updated_at
  before update on stripe_connected_accounts
  for each row execute function extensions.moddatetime(updated_at);

-- ============================================================
-- TOUR REVENUE SPLITS
-- Per-tour configuration of who gets what cut. Sum of basis points
-- across active rows for a tour should equal 10000 (=100%); we
-- enforce that in the application layer rather than the DB so
-- partial drafts are editable.
-- ============================================================
create table if not exists tour_revenue_splits (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete cascade not null,
  payee_user_id uuid references auth.users(id) on delete cascade not null,
  /** Optional Stripe Connect account id of the payee. When set, payouts
   *  for this row are routed via a Transfer to that account. When null
   *  the row is informational only — we track who's owed but settle
   *  off-platform. */
  stripe_account_id text,
  percent_basis_points int not null check (
    percent_basis_points > 0 and percent_basis_points <= 10000
  ),
  role text,
  active boolean default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tour_id, payee_user_id)
);

create index if not exists tour_revenue_splits_tour_idx
  on tour_revenue_splits(tour_id);

alter table tour_revenue_splits enable row level security;

-- Tours don't carry org_id directly — tour-level access flows through
-- tour_members instead. A user can SEE splits on any tour they're a
-- member of; only managers can MUTATE.
create policy "tour_revenue_splits_member_select"
  on tour_revenue_splits for select
  using (
    tour_id in (
      select tour_id from tour_members where user_id = auth.uid()
    )
  );

create policy "tour_revenue_splits_manager_manage"
  on tour_revenue_splits for all
  using (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  )
  with check (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

create or replace trigger tour_revenue_splits_updated_at
  before update on tour_revenue_splits
  for each row execute function extensions.moddatetime(updated_at);

comment on table tour_revenue_splits is
  'Per-tour revenue allocation across artist/venue/crew payees. Percent in basis points (0-10000). When Stripe Connect is enabled, payouts route via Transfer; otherwise rows are informational.';
