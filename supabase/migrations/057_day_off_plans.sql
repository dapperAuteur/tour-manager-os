-- ============================================================
-- Days-off planner for the Family Hub. Touring bands burn out
-- without intentional off-day plans — gym sessions, sightseeing,
-- group meals, errand windows. This table holds a per-tour list of
-- planned activities for non-show days; if member_user_id is null
-- the plan applies to the whole party.
-- ============================================================

create table if not exists day_off_plans (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete cascade not null,
  date date not null,
  /** Null = group plan; everyone's invited. */
  member_user_id uuid references auth.users(id) on delete cascade,
  activity_type text not null default 'rest' check (
    activity_type in ('rest', 'sightseeing', 'gym', 'spa', 'food', 'family', 'errands', 'other')
  ),
  title text not null,
  description text,
  location_name text,
  /** Google Maps search url or any deep link. */
  location_url text,
  status text not null default 'planned' check (
    status in ('planned', 'done', 'skipped')
  ),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table day_off_plans enable row level security;

-- Match the broad pattern: any authenticated user can read/write
-- their own org's tour plans. App layer gates by tour membership.
create policy "day_off_plans_auth_read"
  on day_off_plans for select
  using (auth.uid() is not null);

create policy "day_off_plans_auth_insert"
  on day_off_plans for insert
  with check (created_by = auth.uid() and auth.uid() is not null);

create policy "day_off_plans_creator_or_target_update"
  on day_off_plans for update
  using (
    created_by = auth.uid() or member_user_id = auth.uid()
  )
  with check (
    created_by = auth.uid() or member_user_id = auth.uid()
  );

create policy "day_off_plans_creator_delete"
  on day_off_plans for delete
  using (created_by = auth.uid());

create index if not exists day_off_plans_tour_date_idx
  on day_off_plans(tour_id, date);
create index if not exists day_off_plans_member_idx
  on day_off_plans(member_user_id);

create or replace trigger day_off_plans_updated_at
  before update on day_off_plans
  for each row execute function extensions.moddatetime(updated_at);
