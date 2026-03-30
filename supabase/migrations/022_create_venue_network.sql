-- ============================================================
-- VENUE PROFILES
-- Crowd-sourced venue database built from advance sheets.
-- ============================================================
create table venue_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text,
  country text default 'US',
  address text,
  phone text,
  email text,
  website text,
  venue_type text check (venue_type in ('club', 'theater', 'festival', 'outdoor', 'arena', 'other')),
  capacity int,
  stage_width numeric(8,2),
  stage_depth numeric(8,2),
  stage_height numeric(8,2),
  pa_system text,
  has_stage_door boolean,
  has_rear_door boolean,
  has_backstage_parking boolean,
  dressing_room_count int,
  photo_urls jsonb default '[]',
  lat numeric(10,7),
  lng numeric(10,7),
  times_played int default 0,
  last_played_at date,
  created_from_advance_sheet uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index venue_profiles_name_trgm_idx on venue_profiles using gin (name gin_trgm_ops);
create index venue_profiles_city_trgm_idx on venue_profiles using gin (city gin_trgm_ops);
create index venue_profiles_state_idx on venue_profiles(state);
create index venue_profiles_venue_type_idx on venue_profiles(venue_type);

create trigger venue_profiles_updated_at
  before update on venue_profiles
  for each row execute function extensions.moddatetime(updated_at);

alter table venue_profiles enable row level security;

-- Everyone can read venue profiles
create policy "venue_profiles_public_read"
  on venue_profiles for select
  using (true);

-- Authenticated users can create/update
create policy "venue_profiles_auth_insert"
  on venue_profiles for insert
  with check (auth.uid() is not null);

create policy "venue_profiles_auth_update"
  on venue_profiles for update
  using (auth.uid() is not null);

-- ============================================================
-- VENUE RATINGS
-- Per-org ratings for venues they've played.
-- ============================================================
create table venue_ratings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venue_profiles(id) on delete cascade not null,
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  overall_rating int not null check (overall_rating between 1 and 5),
  sound_rating int check (sound_rating between 1 and 5),
  hospitality_rating int check (hospitality_rating between 1 and 5),
  load_in_rating int check (load_in_rating between 1 and 5),
  dressing_room_rating int check (dressing_room_rating between 1 and 5),
  review text,
  show_date date,
  created_at timestamptz default now(),
  unique(venue_id, org_id)
);

create index venue_ratings_venue_id_idx on venue_ratings(venue_id);

alter table venue_ratings enable row level security;

create policy "venue_ratings_public_read"
  on venue_ratings for select
  using (true);

create policy "venue_ratings_auth_manage"
  on venue_ratings for all
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

-- ============================================================
-- FUZZY VENUE SEARCH
-- ============================================================
create or replace function search_venues(query text, venue_type_filter text default null)
returns table (
  id uuid,
  name text,
  city text,
  state text,
  venue_type text,
  capacity int,
  times_played int,
  similarity real
) as $$
  select
    v.id, v.name, v.city, v.state, v.venue_type, v.capacity, v.times_played,
    greatest(similarity(v.name, query), similarity(v.city, query)) as similarity
  from venue_profiles v
  where (
    v.name % query
    or v.city % query
    or v.name ilike '%' || query || '%'
    or v.city ilike '%' || query || '%'
  )
  and (venue_type_filter is null or v.venue_type = venue_type_filter)
  order by similarity desc
  limit 50;
$$ language sql stable;
