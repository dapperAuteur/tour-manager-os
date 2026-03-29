-- Enable moddatetime extension for updated_at triggers
create extension if not exists moddatetime with schema extensions;

-- ============================================================
-- TOURS
-- ============================================================
create table tours (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  artist_name text not null,
  description text,
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index tours_created_by_idx on tours(created_by);
create index tours_status_idx on tours(status);

-- Updated_at trigger
create trigger tours_updated_at
  before update on tours
  for each row execute function extensions.moddatetime(updated_at);

-- RLS
alter table tours enable row level security;

-- ============================================================
-- TOUR MEMBERS
-- ============================================================
create table tour_members (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('manager', 'member', 'crew')),
  display_name text not null,
  daily_rate numeric(10,2),
  per_diem_rate numeric(10,2) default 50.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tour_id, user_id)
);

create index tour_members_tour_id_idx on tour_members(tour_id);
create index tour_members_user_id_idx on tour_members(user_id);

create trigger tour_members_updated_at
  before update on tour_members
  for each row execute function extensions.moddatetime(updated_at);

alter table tour_members enable row level security;

-- ============================================================
-- TOUR POLICIES
-- ============================================================

-- Members can read tours they belong to
create policy "tour_members_select"
  on tours for select
  using (
    id in (select tour_id from tour_members where user_id = auth.uid())
  );

-- Managers can insert tours (creator becomes manager via trigger)
create policy "tour_managers_insert"
  on tours for insert
  with check (created_by = auth.uid());

-- Managers can update their tours
create policy "tour_managers_update"
  on tours for update
  using (
    id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

-- Managers can delete their tours
create policy "tour_managers_delete"
  on tours for delete
  using (
    id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

-- ============================================================
-- TOUR MEMBER POLICIES
-- ============================================================

-- Members can see other members of tours they belong to
create policy "tour_members_select"
  on tour_members for select
  using (
    tour_id in (select tour_id from tour_members where user_id = auth.uid())
  );

-- Managers can add members
create policy "tour_members_insert"
  on tour_members for insert
  with check (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

-- Managers can update members
create policy "tour_members_update"
  on tour_members for update
  using (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

-- Managers can remove members
create policy "tour_members_delete"
  on tour_members for delete
  using (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

-- ============================================================
-- AUTO-ADD CREATOR AS MANAGER
-- ============================================================
create or replace function add_tour_creator_as_manager()
returns trigger as $$
begin
  insert into tour_members (tour_id, user_id, role, display_name)
  values (
    new.id,
    new.created_by,
    'manager',
    coalesce(
      (select raw_user_meta_data->>'display_name' from auth.users where id = new.created_by),
      'Tour Manager'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger tour_auto_add_creator
  after insert on tours
  for each row execute function add_tour_creator_as_manager();
