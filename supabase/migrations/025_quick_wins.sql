-- ============================================================
-- SETLISTS
-- Per-show setlists with team discussion.
-- ============================================================
create table setlists (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade,
  tour_id uuid references tours(id) on delete cascade not null,
  name text not null default 'Setlist',
  status text default 'draft' check (status in ('draft', 'approved', 'locked')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index setlists_tour_id_idx on setlists(tour_id);
create index setlists_show_id_idx on setlists(show_id);

create trigger setlists_updated_at
  before update on setlists
  for each row execute function extensions.moddatetime(updated_at);

alter table setlists enable row level security;

create policy "setlists_members_select"
  on setlists for select
  using (tour_id in (select get_user_tour_ids()));

create policy "setlists_members_manage"
  on setlists for all
  using (tour_id in (select get_user_tour_ids()));

-- ============================================================
-- SETLIST SONGS
-- ============================================================
create table setlist_songs (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid references setlists(id) on delete cascade not null,
  title text not null,
  duration_seconds int,
  key text,
  tempo int,
  notes text,
  sort_order int default 0,
  is_encore boolean default false,
  created_at timestamptz default now()
);

create index setlist_songs_setlist_id_idx on setlist_songs(setlist_id);

alter table setlist_songs enable row level security;

create policy "setlist_songs_select"
  on setlist_songs for select
  using (setlist_id in (select id from setlists where tour_id in (select get_user_tour_ids())));

create policy "setlist_songs_manage"
  on setlist_songs for all
  using (setlist_id in (select id from setlists where tour_id in (select get_user_tour_ids())));

-- ============================================================
-- SETLIST COMMENTS
-- Team discussion on setlists.
-- ============================================================
create table setlist_comments (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid references setlists(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

create index setlist_comments_setlist_id_idx on setlist_comments(setlist_id);

alter table setlist_comments enable row level security;

create policy "setlist_comments_select"
  on setlist_comments for select
  using (setlist_id in (select id from setlists where tour_id in (select get_user_tour_ids())));

create policy "setlist_comments_insert"
  on setlist_comments for insert
  with check (user_id = auth.uid());

-- ============================================================
-- VENUE CONTACTS (multiple per venue)
-- ============================================================
create table venue_contacts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venue_profiles(id) on delete cascade not null,
  role text not null,
  name text not null,
  phone text,
  email text,
  notes text,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index venue_contacts_venue_id_idx on venue_contacts(venue_id);

alter table venue_contacts enable row level security;

create policy "venue_contacts_read"
  on venue_contacts for select
  using (true);

create policy "venue_contacts_auth_manage"
  on venue_contacts for all
  using (auth.uid() is not null);

-- ============================================================
-- TRAVEL ARRANGEMENTS
-- Hotels, flights, rental cars, equipment for tours.
-- ============================================================
create table travel_arrangements (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete cascade not null,
  show_id uuid references shows(id) on delete set null,
  arrangement_type text not null check (arrangement_type in ('hotel', 'flight', 'rental_car', 'bus', 'equipment_rental', 'other')),
  vendor_name text,
  confirmation_number text,
  check_in date,
  check_out date,
  cost numeric(12,2),
  address text,
  phone text,
  notes text,
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled')),
  booked_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index travel_arrangements_tour_id_idx on travel_arrangements(tour_id);
create index travel_arrangements_show_id_idx on travel_arrangements(show_id);

create trigger travel_arrangements_updated_at
  before update on travel_arrangements
  for each row execute function extensions.moddatetime(updated_at);

alter table travel_arrangements enable row level security;

create policy "travel_arrangements_members_select"
  on travel_arrangements for select
  using (tour_id in (select get_user_tour_ids()));

create policy "travel_arrangements_members_manage"
  on travel_arrangements for all
  using (tour_id in (select get_user_tour_ids()));

-- ============================================================
-- SHARED AUDIO FILES
-- Song demos and recordings for team discussion.
-- ============================================================
create table shared_audio (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  title text not null,
  description text,
  file_url text not null,
  duration_seconds int,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index shared_audio_org_id_idx on shared_audio(org_id);

alter table shared_audio enable row level security;

create policy "shared_audio_org_select"
  on shared_audio for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "shared_audio_org_insert"
  on shared_audio for insert
  with check (org_id in (select org_id from org_members where user_id = auth.uid()));

-- ============================================================
-- AUDIO COMMENTS
-- ============================================================
create table audio_comments (
  id uuid primary key default gen_random_uuid(),
  audio_id uuid references shared_audio(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  timestamp_seconds int,
  created_at timestamptz default now()
);

create index audio_comments_audio_id_idx on audio_comments(audio_id);

alter table audio_comments enable row level security;

create policy "audio_comments_select"
  on audio_comments for select
  using (audio_id in (select id from shared_audio where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "audio_comments_insert"
  on audio_comments for insert
  with check (user_id = auth.uid());

-- ============================================================
-- BLOG POSTS
-- With video/audio embeds and cross-module tagging.
-- ============================================================
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  slug text not null,
  content text not null,
  excerpt text,
  cover_image_url text,
  published boolean default false,
  tags jsonb default '[]',
  linked_shows jsonb default '[]',
  linked_products jsonb default '[]',
  linked_venues jsonb default '[]',
  video_url text,
  audio_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(org_id, slug)
);

create index blog_posts_org_id_idx on blog_posts(org_id);
create index blog_posts_slug_idx on blog_posts(slug);

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function extensions.moddatetime(updated_at);

alter table blog_posts enable row level security;

-- Published posts are public
create policy "blog_posts_public_read"
  on blog_posts for select
  using (published = true or org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "blog_posts_org_manage"
  on blog_posts for all
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

-- ============================================================
-- AUTO-POPULATE STATE INCOME FUNCTION
-- Creates state_income records from show revenue data.
-- ============================================================
create or replace function populate_state_income(p_user_id uuid, p_tour_id uuid)
returns int as $$
declare
  inserted_count int := 0;
  show_rec record;
begin
  for show_rec in
    select s.id as show_id, s.date, s.city, s.state, s.venue_name,
           coalesce(sr.total_revenue, 0) as gross_income,
           extract(year from s.date)::int as tax_year
    from shows s
    left join show_revenue sr on sr.show_id = s.id
    where s.tour_id = p_tour_id
      and s.state is not null
      and s.status in ('confirmed', 'completed')
  loop
    insert into state_income (user_id, tour_id, show_id, state, city, venue_name, performance_date, gross_income, tax_year)
    values (p_user_id, p_tour_id, show_rec.show_id, show_rec.state, show_rec.city, show_rec.venue_name, show_rec.date, show_rec.gross_income, show_rec.tax_year)
    on conflict do nothing;
    inserted_count := inserted_count + 1;
  end loop;

  return inserted_count;
end;
$$ language plpgsql security definer;
