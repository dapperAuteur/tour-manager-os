-- ============================================================
-- EQUIPMENT INVENTORY
-- What the band owns/travels with vs what venues provide.
-- ============================================================
create table equipment (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  category text not null check (category in (
    'instrument', 'amplifier', 'microphone', 'cable', 'stand',
    'lighting', 'monitor', 'di_box', 'effects', 'drum', 'keyboard',
    'case', 'merch_display', 'other'
  )),
  description text,
  serial_number text,
  quantity int default 1,
  condition text check (condition in ('excellent', 'good', 'fair', 'needs_repair', 'retired')),
  travels_with_band boolean default true,
  owner text,
  purchase_date date,
  purchase_price numeric(10,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index equipment_org_id_idx on equipment(org_id);
create index equipment_category_idx on equipment(category);

create trigger equipment_updated_at
  before update on equipment
  for each row execute function extensions.moddatetime(updated_at);

alter table equipment enable row level security;

create policy "equipment_org_select"
  on equipment for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "equipment_org_manage"
  on equipment for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- STAGE PLOTS
-- Per-show stage layout with positioned elements.
-- ============================================================
create table stage_plots (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  show_id uuid references shows(id) on delete set null,
  name text not null,
  description text,
  stage_width numeric(8,2),
  stage_depth numeric(8,2),
  elements jsonb default '[]',  -- [{type, label, x, y, width, height, rotation}]
  is_default boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index stage_plots_org_id_idx on stage_plots(org_id);
create index stage_plots_show_id_idx on stage_plots(show_id);

create trigger stage_plots_updated_at
  before update on stage_plots
  for each row execute function extensions.moddatetime(updated_at);

alter table stage_plots enable row level security;

create policy "stage_plots_org_select"
  on stage_plots for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "stage_plots_org_manage"
  on stage_plots for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- INPUT LISTS / PATCH SHEETS
-- Channel-by-channel audio input list.
-- ============================================================
create table input_lists (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index input_lists_org_id_idx on input_lists(org_id);

create trigger input_lists_updated_at
  before update on input_lists
  for each row execute function extensions.moddatetime(updated_at);

alter table input_lists enable row level security;

create policy "input_lists_org_select"
  on input_lists for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "input_lists_org_manage"
  on input_lists for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- INPUT LIST CHANNELS
-- ============================================================
create table input_channels (
  id uuid primary key default gen_random_uuid(),
  input_list_id uuid references input_lists(id) on delete cascade not null,
  channel_number int not null,
  instrument text not null,
  microphone text,
  stand_type text,
  di_box boolean default false,
  phantom_power boolean default false,
  notes text,
  sort_order int default 0
);

create index input_channels_list_id_idx on input_channels(input_list_id);

alter table input_channels enable row level security;

create policy "input_channels_select"
  on input_channels for select
  using (input_list_id in (select id from input_lists where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "input_channels_manage"
  on input_channels for all
  using (input_list_id in (select id from input_lists where org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin'))));

-- ============================================================
-- VENUE NOTES
-- Historical notes about venues that persist across tours.
-- ============================================================
create table venue_notes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  venue_name text not null,
  city text,
  state text,
  content text not null,
  category text check (category in ('load_in', 'parking', 'stage', 'sound', 'catering', 'dressing_room', 'security', 'general')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index venue_notes_org_id_idx on venue_notes(org_id);
create index venue_notes_venue_trgm_idx on venue_notes using gin (venue_name gin_trgm_ops);

create trigger venue_notes_updated_at
  before update on venue_notes
  for each row execute function extensions.moddatetime(updated_at);

alter table venue_notes enable row level security;

create policy "venue_notes_org_select"
  on venue_notes for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "venue_notes_org_manage"
  on venue_notes for all
  using (org_id in (select org_id from org_members where user_id = auth.uid()));
