-- ============================================================
-- VENUE STAGES / SPACES
-- Venues can have multiple stages, rooms, or performance spaces.
-- ============================================================
create table venue_stages (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venue_profiles(id) on delete cascade not null,
  name text not null,
  stage_type text not null check (stage_type in ('main_stage', 'second_stage', 'outdoor_stage', 'indoor_room', 'outdoor_area', 'rooftop', 'basement', 'other')),
  is_indoor boolean not null default true,
  capacity int,
  stage_width numeric(8,2),
  stage_depth numeric(8,2),
  stage_height numeric(8,2),
  pa_system text,
  has_monitors boolean default true,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index venue_stages_venue_id_idx on venue_stages(venue_id);

alter table venue_stages enable row level security;

create policy "venue_stages_public_read"
  on venue_stages for select
  using (true);

create policy "venue_stages_auth_manage"
  on venue_stages for all
  using (auth.uid() is not null);

-- ============================================================
-- WEATHER CACHE
-- Cache weather data for show dates to avoid repeated API calls.
-- ============================================================
create table weather_cache (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade not null unique,
  city text not null,
  state text,
  date date not null,
  temp_high_f int,
  temp_low_f int,
  description text,
  icon text,
  precipitation_pct int,
  wind_mph int,
  fetched_at timestamptz default now()
);

create index weather_cache_show_id_idx on weather_cache(show_id);

alter table weather_cache enable row level security;

create policy "weather_cache_read"
  on weather_cache for select
  using (true);

-- ============================================================
-- SMART ADVANCE PRE-FILL
-- Function to get past advance sheet data for a venue.
-- ============================================================
create or replace function get_venue_prefill(p_venue_name text, p_city text)
returns jsonb as $$
declare
  result jsonb;
begin
  select to_jsonb(a.*) into result
  from advance_sheets a
  join shows s on s.id = a.show_id
  where s.venue_name ilike p_venue_name
    and s.city ilike p_city
    and a.status = 'complete'
  order by a.submitted_at desc
  limit 1;

  return coalesce(result, '{}'::jsonb);
end;
$$ language plpgsql stable security definer;
