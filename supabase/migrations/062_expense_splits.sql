-- ============================================================
-- EXPENSE COST SPLITTING
-- A tour-manager pays for a meal, hotel, or piece of gear and
-- needs to split the cost across the band. expense_splits records
-- per-member shares of a single expense. The originating expense
-- still belongs to whoever fronted the money; settlements happen
-- inline here without disturbing tour P&L.
-- ============================================================

create table if not exists expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references expenses(id) on delete cascade not null,
  /** The member who owes (or paid for) this share of the expense. */
  user_id uuid references auth.users(id) on delete cascade not null,
  share_amount numeric(12,2) not null check (share_amount > 0),
  status text not null default 'owed' check (status in ('owed', 'settled', 'waived')),
  settled_method text check (
    settled_method is null
    or settled_method in ('cash', 'venmo', 'zelle', 'paypal', 'cash_app', 'bank', 'other')
  ),
  settled_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (expense_id, user_id)
);

create index if not exists expense_splits_expense_idx
  on expense_splits(expense_id);
create index if not exists expense_splits_user_status_idx
  on expense_splits(user_id, status);

alter table expense_splits enable row level security;

-- Any signed-in user can read splits — the per-row scoping happens
-- in the queries (own user_id OR creator OR expense owner). The
-- finances module is opt-in per org, so the audience is already
-- gated upstream.
create policy "expense_splits_auth_read"
  on expense_splits for select
  using (auth.uid() is not null);

-- Only the share creator can insert a row, and only for an expense
-- they have access to via the finances module. Enforced by app
-- code; RLS just requires the inserter to identify as creator.
create policy "expense_splits_creator_insert"
  on expense_splits for insert
  with check (auth.uid() is not null and created_by = auth.uid());

-- Either the share owner or the creator can mark it settled / waived.
create policy "expense_splits_owner_or_creator_update"
  on expense_splits for update
  using (user_id = auth.uid() or created_by = auth.uid())
  with check (user_id = auth.uid() or created_by = auth.uid());

create policy "expense_splits_creator_delete"
  on expense_splits for delete
  using (created_by = auth.uid());

create or replace trigger expense_splits_updated_at
  before update on expense_splits
  for each row execute function extensions.moddatetime(updated_at);

comment on table expense_splits is
  'Per-member shares of an expense for cost splitting. Independent of tour P&L — settlements flow between members.';
