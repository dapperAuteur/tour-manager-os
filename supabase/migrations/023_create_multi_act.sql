-- ============================================================
-- TOUR PACKAGES
-- A tour package groups multiple acts sharing a bill.
-- ============================================================
create table tour_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  package_type text not null default 'tour' check (package_type in ('tour', 'festival', 'residency')),
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  created_by uuid references auth.users(id),
  org_id uuid references organizations(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index tour_packages_org_id_idx on tour_packages(org_id);

create trigger tour_packages_updated_at
  before update on tour_packages
  for each row execute function extensions.moddatetime(updated_at);

alter table tour_packages enable row level security;

create policy "tour_packages_org_select"
  on tour_packages for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "tour_packages_org_manage"
  on tour_packages for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- PACKAGE ACTS
-- Acts participating in a tour package.
-- ============================================================
create table package_acts (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references tour_packages(id) on delete cascade not null,
  tour_id uuid references tours(id) on delete set null,
  act_name text not null,
  act_type text not null default 'support' check (act_type in ('headliner', 'support', 'opener', 'special_guest')),
  org_id uuid references organizations(id) on delete set null,
  contact_name text,
  contact_email text,
  contact_phone text,
  set_length_minutes int,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index package_acts_package_id_idx on package_acts(package_id);

alter table package_acts enable row level security;

create policy "package_acts_select"
  on package_acts for select
  using (package_id in (select id from tour_packages where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "package_acts_manage"
  on package_acts for all
  using (package_id in (select id from tour_packages where org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin'))));

-- ============================================================
-- PRODUCTION TIMELINE
-- Shared per-show timeline for multi-act coordination.
-- ============================================================
create table production_timeline (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references tour_packages(id) on delete cascade not null,
  show_id uuid references shows(id) on delete set null,
  date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(package_id, date)
);

create index production_timeline_package_id_idx on production_timeline(package_id);

create trigger production_timeline_updated_at
  before update on production_timeline
  for each row execute function extensions.moddatetime(updated_at);

alter table production_timeline enable row level security;

create policy "production_timeline_select"
  on production_timeline for select
  using (package_id in (select id from tour_packages where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "production_timeline_manage"
  on production_timeline for all
  using (package_id in (select id from tour_packages where org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin'))));

-- ============================================================
-- TIMELINE BLOCKS
-- Individual time blocks within a production timeline.
-- ============================================================
create table timeline_blocks (
  id uuid primary key default gen_random_uuid(),
  timeline_id uuid references production_timeline(id) on delete cascade not null,
  act_id uuid references package_acts(id) on delete set null,
  start_time time not null,
  end_time time,
  block_type text not null check (block_type in (
    'load_in', 'soundcheck', 'changeover', 'performance',
    'meet_greet', 'doors', 'curfew', 'break', 'other'
  )),
  label text not null,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index timeline_blocks_timeline_id_idx on timeline_blocks(timeline_id);

alter table timeline_blocks enable row level security;

create policy "timeline_blocks_select"
  on timeline_blocks for select
  using (timeline_id in (select id from production_timeline where package_id in (select id from tour_packages where org_id in (select org_id from org_members where user_id = auth.uid()))));

create policy "timeline_blocks_manage"
  on timeline_blocks for all
  using (timeline_id in (select id from production_timeline where package_id in (select id from tour_packages where org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')))));
