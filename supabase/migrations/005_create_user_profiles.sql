-- ============================================================
-- USER PROFILES
-- Stores user preferences and settings beyond auth metadata.
-- ============================================================
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  phone text,
  timezone text default 'America/New_York',
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  home_page text default '/dashboard',
  email_notifications boolean default true,
  push_notifications boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function extensions.moddatetime(updated_at);

alter table user_profiles enable row level security;

-- Users can read their own profile
create policy "user_profiles_own_select"
  on user_profiles for select
  using (id = auth.uid());

-- Users can update their own profile
create policy "user_profiles_own_update"
  on user_profiles for update
  using (id = auth.uid());

-- Users can insert their own profile
create policy "user_profiles_own_insert"
  on user_profiles for insert
  with check (id = auth.uid());

-- Auto-create profile on user signup
create or replace function create_user_profile()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function create_user_profile();
