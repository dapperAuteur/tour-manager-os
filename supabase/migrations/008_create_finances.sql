-- ============================================================
-- EXPENSES
-- Track all tour expenses by category with receipt uploads.
-- ============================================================
create table expenses (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete cascade not null,
  show_id uuid references shows(id) on delete set null,
  member_id uuid references auth.users(id) on delete set null,
  date date not null,
  category text not null check (category in (
    'travel', 'hotel', 'per_diem', 'meals', 'equipment',
    'crew', 'merch', 'marketing', 'insurance', 'other'
  )),
  amount numeric(12,2) not null,
  description text,
  receipt_url text,
  is_tax_deductible boolean default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'reimbursed', 'rejected')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index expenses_tour_id_idx on expenses(tour_id);
create index expenses_show_id_idx on expenses(show_id);
create index expenses_member_id_idx on expenses(member_id);
create index expenses_date_idx on expenses(date);
create index expenses_category_idx on expenses(category);

create trigger expenses_updated_at
  before update on expenses
  for each row execute function extensions.moddatetime(updated_at);

alter table expenses enable row level security;

-- Members can see expenses for tours they belong to
create policy "expenses_members_select"
  on expenses for select
  using (tour_id in (select get_user_tour_ids()));

-- Paid members can create expenses
create policy "expenses_members_insert"
  on expenses for insert
  with check (tour_id in (select get_user_tour_ids()));

-- Members can update their own expenses
create policy "expenses_members_update"
  on expenses for update
  using (member_id = auth.uid());

-- Managers can update any expense in their tours
create policy "expenses_managers_update"
  on expenses for update
  using (tour_id in (select get_user_tour_ids()));

-- Members can delete their own pending expenses
create policy "expenses_members_delete"
  on expenses for delete
  using (member_id = auth.uid() and status = 'pending');

-- ============================================================
-- SHOW REVENUE
-- Track revenue per show (guarantee, tickets, merch).
-- ============================================================
create table show_revenue (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade not null unique,
  guarantee numeric(12,2),
  ticket_sales numeric(12,2),
  merch_sales numeric(12,2),
  other_revenue numeric(12,2),
  other_revenue_description text,
  total_revenue numeric(12,2) generated always as (
    coalesce(guarantee, 0) + coalesce(ticket_sales, 0) +
    coalesce(merch_sales, 0) + coalesce(other_revenue, 0)
  ) stored,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index show_revenue_show_id_idx on show_revenue(show_id);

create trigger show_revenue_updated_at
  before update on show_revenue
  for each row execute function extensions.moddatetime(updated_at);

alter table show_revenue enable row level security;

create policy "show_revenue_members_select"
  on show_revenue for select
  using (
    show_id in (
      select s.id from shows s where s.tour_id in (select get_user_tour_ids())
    )
  );

create policy "show_revenue_managers_all"
  on show_revenue for all
  using (
    show_id in (
      select s.id from shows s where s.tour_id in (select get_user_tour_ids())
    )
  );

-- ============================================================
-- SETTLEMENTS
-- Per-show P&L summary.
-- ============================================================
create table settlements (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade not null unique,
  tour_id uuid references tours(id) on delete cascade not null,
  total_revenue numeric(12,2) default 0,
  total_expenses numeric(12,2) default 0,
  net_profit numeric(12,2) generated always as (
    coalesce(total_revenue, 0) - coalesce(total_expenses, 0)
  ) stored,
  settlement_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index settlements_tour_id_idx on settlements(tour_id);

create trigger settlements_updated_at
  before update on settlements
  for each row execute function extensions.moddatetime(updated_at);

alter table settlements enable row level security;

create policy "settlements_members_select"
  on settlements for select
  using (tour_id in (select get_user_tour_ids()));

create policy "settlements_managers_all"
  on settlements for all
  using (tour_id in (select get_user_tour_ids()));

-- ============================================================
-- MEMBER PAYOUTS
-- Track what each member is owed/paid per show.
-- ============================================================
create table member_payouts (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid references settlements(id) on delete cascade not null,
  member_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  type text not null check (type in ('share', 'per_diem', 'reimbursement', 'bonus')),
  paid boolean default false,
  paid_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create index member_payouts_settlement_id_idx on member_payouts(settlement_id);
create index member_payouts_member_id_idx on member_payouts(member_id);

alter table member_payouts enable row level security;

-- Members can see their own payouts
create policy "member_payouts_own_select"
  on member_payouts for select
  using (member_id = auth.uid());

-- Managers can see all payouts for their tours
create policy "member_payouts_managers_select"
  on member_payouts for select
  using (
    settlement_id in (
      select s.id from settlements s where s.tour_id in (select get_user_tour_ids())
    )
  );

create policy "member_payouts_managers_all"
  on member_payouts for all
  using (
    settlement_id in (
      select s.id from settlements s where s.tour_id in (select get_user_tour_ids())
    )
  );
