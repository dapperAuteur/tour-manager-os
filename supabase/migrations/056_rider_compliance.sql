-- ============================================================
-- Rider compliance checklist per show. The band sets rider items
-- (PA monitors, deli tray, towels, parking, etc.); the production
-- lead checks each one against what the venue actually delivered.
--
-- Org-level templates live in `org_rider_items` so a band doesn't
-- retype the same 30 line items every show. When a show wants a
-- checklist, those template rows are copied (or referenced + status
-- captured) into `show_rider_checks`. We keep status on the show
-- row so historical compliance stays correct after the template
-- evolves.
-- ============================================================

create table if not exists org_rider_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  category text not null default 'hospitality' check (
    category in ('technical', 'hospitality', 'dressing_room', 'crew', 'transportation', 'security', 'other')
  ),
  description text not null,
  expected_quantity int,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table org_rider_items enable row level security;

create policy "org_rider_items_org_read"
  on org_rider_items for select
  using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "org_rider_items_org_manage"
  on org_rider_items for all
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

create index if not exists org_rider_items_org_idx on org_rider_items(org_id, sort_order);

create table if not exists show_rider_checks (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade not null,
  /** Snapshot from the org template — historical accuracy. */
  source_item_id uuid references org_rider_items(id) on delete set null,
  category text not null default 'hospitality',
  description text not null,
  expected_quantity int,
  actual_quantity int,
  status text not null default 'pending' check (
    status in ('pending', 'delivered', 'partial', 'missing', 'na')
  ),
  notes text,
  checked_by_user_id uuid references auth.users(id) on delete set null,
  checked_at timestamptz,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table show_rider_checks enable row level security;

-- Broad auth — matches venue_contacts policy. App-layer routes for
-- this already gate on tour membership.
create policy "show_rider_checks_auth_read"
  on show_rider_checks for select
  using (auth.uid() is not null);

create policy "show_rider_checks_auth_manage"
  on show_rider_checks for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create index if not exists show_rider_checks_show_idx on show_rider_checks(show_id, sort_order);
create index if not exists show_rider_checks_status_idx on show_rider_checks(status);

create or replace trigger show_rider_checks_updated_at
  before update on show_rider_checks
  for each row execute function extensions.moddatetime(updated_at);
