-- ============================================================
-- ADVANCE SHEETS
-- The questionnaire sent to venues before each show.
-- Token-based public access (no auth required for venues).
-- ============================================================
create table advance_sheets (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade not null unique,
  token uuid default gen_random_uuid() not null unique,
  status text not null default 'pending' check (status in ('pending', 'partial', 'complete')),

  -- Venue details
  venue_type text check (venue_type in ('club', 'theater', 'festival', 'outdoor', 'arena', 'other')),
  venue_capacity int,
  venue_address text,
  venue_phone text,
  venue_backstage_phone text,
  venue_fax text,

  -- Dressing rooms
  dressing_room_count int,
  dressing_room_location text,
  dressing_room_lockable boolean,
  dressing_room_washbasin boolean,
  dressing_room_toilet boolean,
  dressing_room_shower boolean,
  security_guard_name text,
  security_guard_phone text,

  -- Hospitality
  hospitality_provider_name text,
  hospitality_provider_phone text,
  per_diem_contact_name text,
  per_diem_amount numeric(10,2) default 50.00,
  caterer_name text,
  caterer_phone text,
  meal_times text,

  -- Production
  stage_width numeric(8,2),
  stage_depth numeric(8,2),
  stage_height numeric(8,2),
  has_stage_door boolean,
  has_rear_door boolean,
  has_backstage_parking boolean,
  pa_system text,
  radio_mic_type text,
  delay_unit_type text,
  reverb_unit_type text,
  has_smoke_machines boolean,
  smoke_machine_notes text,

  -- Show details
  doors_time time,
  soundcheck_time time,
  stage_time time,
  curfew_time time,
  performance_length_minutes int,
  show_format text check (show_format in ('live', 'playback')),
  number_of_performances int default 1,
  ticket_price numeric(10,2),
  total_gross numeric(12,2),
  smoking_allowed boolean default false,

  -- Merch
  merch_area_description text,
  merch_split text,

  -- Sound company
  sound_company_name text,
  sound_company_phone text,
  sound_company_email text,

  -- Flexible metadata for venue-specific fields
  metadata jsonb default '{}',

  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index advance_sheets_show_id_idx on advance_sheets(show_id);
create index advance_sheets_token_idx on advance_sheets(token);
create index advance_sheets_status_idx on advance_sheets(status);

create trigger advance_sheets_updated_at
  before update on advance_sheets
  for each row execute function extensions.moddatetime(updated_at);

alter table advance_sheets enable row level security;

-- Tour members can read advance sheets for their shows
create policy "advance_sheets_members_select"
  on advance_sheets for select
  using (
    show_id in (
      select s.id from shows s
      join tour_members tm on tm.tour_id = s.tour_id
      where tm.user_id = auth.uid()
    )
  );

-- Managers can create advance sheets
create policy "advance_sheets_managers_insert"
  on advance_sheets for insert
  with check (
    show_id in (
      select s.id from shows s
      join tour_members tm on tm.tour_id = s.tour_id
      where tm.user_id = auth.uid() and tm.role = 'manager'
    )
  );

-- Managers can update advance sheets
create policy "advance_sheets_managers_update"
  on advance_sheets for update
  using (
    show_id in (
      select s.id from shows s
      join tour_members tm on tm.tour_id = s.tour_id
      where tm.user_id = auth.uid() and tm.role = 'manager'
    )
  );

-- Public access via token (for venue contacts filling out the form)
-- This is handled via service role in the API route, not RLS.

-- ============================================================
-- ADVANCE SHEET CONTACTS
-- ============================================================
create table advance_contacts (
  id uuid primary key default gen_random_uuid(),
  advance_sheet_id uuid references advance_sheets(id) on delete cascade not null,
  role text not null check (role in ('promoter', 'production', 'catering', 'pr', 'sponsorship', 'security', 'sound', 'backline', 'other')),
  company_name text,
  contact_name text,
  phone text,
  mobile text,
  email text,
  fax text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index advance_contacts_sheet_id_idx on advance_contacts(advance_sheet_id);

create trigger advance_contacts_updated_at
  before update on advance_contacts
  for each row execute function extensions.moddatetime(updated_at);

alter table advance_contacts enable row level security;

-- Members can read contacts for their advance sheets
create policy "advance_contacts_members_select"
  on advance_contacts for select
  using (
    advance_sheet_id in (
      select a.id from advance_sheets a
      join shows s on s.id = a.show_id
      join tour_members tm on tm.tour_id = s.tour_id
      where tm.user_id = auth.uid()
    )
  );

-- Managers can manage contacts
create policy "advance_contacts_managers_insert"
  on advance_contacts for insert
  with check (
    advance_sheet_id in (
      select a.id from advance_sheets a
      join shows s on s.id = a.show_id
      join tour_members tm on tm.tour_id = s.tour_id
      where tm.user_id = auth.uid() and tm.role = 'manager'
    )
  );

create policy "advance_contacts_managers_update"
  on advance_contacts for update
  using (
    advance_sheet_id in (
      select a.id from advance_sheets a
      join shows s on s.id = a.show_id
      join tour_members tm on tm.tour_id = s.tour_id
      where tm.user_id = auth.uid() and tm.role = 'manager'
    )
  );

create policy "advance_contacts_managers_delete"
  on advance_contacts for delete
  using (
    advance_sheet_id in (
      select a.id from advance_sheets a
      join shows s on s.id = a.show_id
      join tour_members tm on tm.tour_id = s.tour_id
      where tm.user_id = auth.uid() and tm.role = 'manager'
    )
  );

-- ============================================================
-- ADVANCE SHEET OTHER ARTISTS
-- ============================================================
create table advance_other_artists (
  id uuid primary key default gen_random_uuid(),
  advance_sheet_id uuid references advance_sheets(id) on delete cascade not null,
  artist_name text not null,
  slot text check (slot in ('support_a', 'support_b', 'support_c', 'support_d', 'headliner')),
  set_length_minutes int,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index advance_other_artists_sheet_id_idx on advance_other_artists(advance_sheet_id);

alter table advance_other_artists enable row level security;

-- Members can read other artists
create policy "advance_other_artists_members_select"
  on advance_other_artists for select
  using (
    advance_sheet_id in (
      select a.id from advance_sheets a
      join shows s on s.id = a.show_id
      join tour_members tm on tm.tour_id = s.tour_id
      where tm.user_id = auth.uid()
    )
  );

-- Managers can manage other artists
create policy "advance_other_artists_managers_all"
  on advance_other_artists for all
  using (
    advance_sheet_id in (
      select a.id from advance_sheets a
      join shows s on s.id = a.show_id
      join tour_members tm on tm.tour_id = s.tour_id
      where tm.user_id = auth.uid() and tm.role = 'manager'
    )
  );
