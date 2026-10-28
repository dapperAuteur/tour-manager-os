-- ============================================================
-- Festival mode: assign acts to stages with start times per show.
--
-- A show normally has one act (the tour's headliner). For festivals,
-- multi-act bills, and the band's own showcases with openers, each
-- act gets a slot on a stage at a time. Slots reference:
--   - venue_stages (which stage in the venue)
--   - package_acts (which act from the multi-act lineup)
-- Either can be null for one-off entries (e.g. a comedy interlude
-- act not tracked as a package_act).
-- ============================================================

create table if not exists festival_slots (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade not null,
  /** Which stage at the venue. Optional for one-stage shows. */
  stage_id uuid references venue_stages(id) on delete set null,
  /** Which act from the multi-act lineup. Optional for guest acts. */
  package_act_id uuid references package_acts(id) on delete set null,
  /** Free-form name override (used when no package_act, or to rename a guest). */
  act_name_override text,
  set_start_at timestamptz,
  set_length_minutes int check (set_length_minutes > 0 and set_length_minutes <= 600),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table festival_slots enable row level security;

-- Match the venue_stages broad policy: any authenticated user can
-- read + manage. App-layer routes that touch this already gate on
-- tour membership via the existing tours RLS.
create policy "festival_slots_auth_read"
  on festival_slots for select
  using (auth.uid() is not null);

create policy "festival_slots_auth_manage"
  on festival_slots for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create index if not exists festival_slots_show_idx on festival_slots(show_id);
create index if not exists festival_slots_stage_idx on festival_slots(stage_id);
create index if not exists festival_slots_act_idx on festival_slots(package_act_id);
create index if not exists festival_slots_start_idx
  on festival_slots(show_id, set_start_at);

create or replace trigger festival_slots_updated_at
  before update on festival_slots
  for each row execute function extensions.moddatetime(updated_at);
