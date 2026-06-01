-- ============================================================
-- Multiple stages / spaces per venue.
--
-- The existing `venue_profiles.stage_width/depth/height` columns
-- model a single primary stage. Many venues (festivals, multi-room
-- clubs, theaters with a small upstairs) have several stages, and
-- which one matters depends on the show. This table holds the full
-- list; the venue profile keeps the legacy columns as "default
-- stage" until callers migrate.
-- ============================================================

create table if not exists venue_stages (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venue_profiles(id) on delete cascade not null,
  name text not null,
  /** Indoor / outdoor / tent / other — explicit communication for routing decisions. */
  location text not null default 'indoor' check (location in ('indoor', 'outdoor', 'tent', 'other')),
  capacity int,
  stage_width numeric(6, 2),
  stage_depth numeric(6, 2),
  stage_height numeric(6, 2),
  pa_system text,
  notes text,
  created_at timestamptz default now(),
  unique(venue_id, name)
);

alter table venue_stages enable row level security;

-- Match the venue_contacts policy: any authenticated user reads + writes.
create policy "venue_stages_auth_read"
  on venue_stages for select
  using (auth.uid() is not null);

create policy "venue_stages_auth_manage"
  on venue_stages for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create index if not exists venue_stages_venue_idx on venue_stages(venue_id);
