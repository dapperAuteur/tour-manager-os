-- ============================================================
-- PHASE 16: CSV import wizard — `csv_imports` table tracks every
-- import attempt so users can see a history (and we can surface
-- which targets are popular). Errors stored as jsonb so the UI
-- can show row-level failures.
-- ============================================================

create table if not exists csv_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  org_id uuid references organizations(id) on delete cascade,
  target text not null check (target in ('shows', 'expenses', 'contacts')),
  tour_id uuid references tours(id) on delete set null,
  filename text,
  total_rows int not null default 0,
  imported_rows int not null default 0,
  skipped_rows int not null default 0,
  errors jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table csv_imports enable row level security;

create policy "csv_imports_org_read"
  on csv_imports for select
  using (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );

create policy "csv_imports_self_insert"
  on csv_imports for insert
  with check (user_id = auth.uid());

create index if not exists csv_imports_org_idx on csv_imports(org_id, created_at desc);
create index if not exists csv_imports_target_idx on csv_imports(target);
