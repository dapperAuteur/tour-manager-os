-- ============================================================
-- POLLS
-- ============================================================
create table polls (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  tour_id uuid references tours(id) on delete set null,
  question text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'closed')),
  allow_multiple boolean default false,
  created_by uuid references auth.users(id) not null,
  closes_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index polls_org_id_idx on polls(org_id);

create trigger polls_updated_at
  before update on polls
  for each row execute function extensions.moddatetime(updated_at);

alter table polls enable row level security;

create policy "polls_org_select"
  on polls for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "polls_org_insert"
  on polls for insert
  with check (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "polls_creator_manage"
  on polls for all
  using (created_by = auth.uid());

-- ============================================================
-- POLL OPTIONS
-- ============================================================
create table poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade not null,
  label text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index poll_options_poll_id_idx on poll_options(poll_id);

alter table poll_options enable row level security;

create policy "poll_options_select"
  on poll_options for select
  using (poll_id in (select id from polls where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "poll_options_insert"
  on poll_options for insert
  with check (poll_id in (select id from polls where created_by = auth.uid()));

-- ============================================================
-- POLL VOTES
-- ============================================================
create table poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade not null,
  option_id uuid references poll_options(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(poll_id, option_id, user_id)
);

create index poll_votes_poll_id_idx on poll_votes(poll_id);
create index poll_votes_user_id_idx on poll_votes(user_id);

alter table poll_votes enable row level security;

create policy "poll_votes_select"
  on poll_votes for select
  using (poll_id in (select id from polls where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "poll_votes_insert"
  on poll_votes for insert
  with check (user_id = auth.uid());

create policy "poll_votes_delete_own"
  on poll_votes for delete
  using (user_id = auth.uid());

-- ============================================================
-- PRACTICE SESSIONS
-- ============================================================
create table practice_sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  title text not null,
  description text,
  location text,
  date date not null,
  start_time time not null,
  end_time time,
  timezone text default 'America/New_York',
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index practice_sessions_org_id_idx on practice_sessions(org_id);
create index practice_sessions_date_idx on practice_sessions(date);

create trigger practice_sessions_updated_at
  before update on practice_sessions
  for each row execute function extensions.moddatetime(updated_at);

alter table practice_sessions enable row level security;

create policy "practice_sessions_org_select"
  on practice_sessions for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "practice_sessions_org_insert"
  on practice_sessions for insert
  with check (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "practice_sessions_creator_manage"
  on practice_sessions for all
  using (created_by = auth.uid());

-- Admin can manage all
create policy "practice_sessions_admin_manage"
  on practice_sessions for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- PRACTICE RSVPS
-- ============================================================
create table practice_rsvps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references practice_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'going' check (status in ('going', 'maybe', 'not_going')),
  created_at timestamptz default now(),
  unique(session_id, user_id)
);

create index practice_rsvps_session_id_idx on practice_rsvps(session_id);

alter table practice_rsvps enable row level security;

create policy "practice_rsvps_select"
  on practice_rsvps for select
  using (session_id in (select id from practice_sessions where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "practice_rsvps_own"
  on practice_rsvps for all
  using (user_id = auth.uid());

-- ============================================================
-- SHARED ALBUMS
-- ============================================================
create table shared_albums (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  tour_id uuid references tours(id) on delete set null,
  title text not null,
  description text,
  cover_url text,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index shared_albums_org_id_idx on shared_albums(org_id);

create trigger shared_albums_updated_at
  before update on shared_albums
  for each row execute function extensions.moddatetime(updated_at);

alter table shared_albums enable row level security;

create policy "shared_albums_org_select"
  on shared_albums for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "shared_albums_org_insert"
  on shared_albums for insert
  with check (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "shared_albums_creator_manage"
  on shared_albums for all
  using (created_by = auth.uid());

-- ============================================================
-- ALBUM MEDIA
-- ============================================================
create table album_media (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references shared_albums(id) on delete cascade not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index album_media_album_id_idx on album_media(album_id);

alter table album_media enable row level security;

create policy "album_media_select"
  on album_media for select
  using (album_id in (select id from shared_albums where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "album_media_insert"
  on album_media for insert
  with check (album_id in (select id from shared_albums where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "album_media_delete_own"
  on album_media for delete
  using (uploaded_by = auth.uid());
