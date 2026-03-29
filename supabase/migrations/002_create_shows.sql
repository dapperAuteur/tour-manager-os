-- ============================================================
-- SHOWS
-- ============================================================
create table shows (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete cascade not null,
  date date not null,
  city text not null,
  state text,
  country text default 'US',
  venue_name text,
  status text not null default 'draft' check (status in ('draft', 'advance_sent', 'confirmed', 'completed', 'cancelled')),
  timezone text default 'America/New_York',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index shows_tour_id_idx on shows(tour_id);
create index shows_date_idx on shows(date);
create index shows_status_idx on shows(status);

create trigger shows_updated_at
  before update on shows
  for each row execute function extensions.moddatetime(updated_at);

alter table shows enable row level security;

-- Members can read shows for tours they belong to
create policy "shows_members_select"
  on shows for select
  using (
    tour_id in (select tour_id from tour_members where user_id = auth.uid())
  );

-- Managers can insert shows
create policy "shows_managers_insert"
  on shows for insert
  with check (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

-- Managers can update shows
create policy "shows_managers_update"
  on shows for update
  using (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

-- Managers can delete shows
create policy "shows_managers_delete"
  on shows for delete
  using (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );
