-- ============================================================
-- ORGANIZATIONS
-- Each band/group is an organization. Supports multi-tenant.
-- ============================================================
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  brand_colors jsonb default '{}',
  custom_domain text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  subscription_status text default 'active' check (subscription_status in ('active', 'past_due', 'cancelled', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger organizations_updated_at
  before update on organizations
  for each row execute function extensions.moddatetime(updated_at);

alter table organizations enable row level security;

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
create table org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  is_paid boolean default false,
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

create index org_members_org_id_idx on org_members(org_id);
create index org_members_user_id_idx on org_members(user_id);

alter table org_members enable row level security;

-- Members can see their org
create policy "org_select_members"
  on organizations for select
  using (id in (select org_id from org_members where user_id = auth.uid()));

-- Owners can update org
create policy "org_update_owners"
  on organizations for update
  using (id in (select org_id from org_members where user_id = auth.uid() and role = 'owner'));

-- Any authenticated user can create an org
create policy "org_insert_auth"
  on organizations for insert
  with check (created_by = auth.uid());

-- Org members policies
create policy "org_members_select"
  on org_members for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "org_members_manage"
  on org_members for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- MODULES
-- Registry of all available feature modules.
-- ============================================================
create table modules (
  id text primary key,  -- slug: 'advance-sheets', 'finances', etc.
  name text not null,
  description text not null,
  icon text not null,   -- Lucide icon name
  tier text not null default 'free' check (tier in ('free', 'pro', 'enterprise')),
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table modules enable row level security;

-- Everyone can read modules
create policy "modules_public_read"
  on modules for select
  using (true);

-- ============================================================
-- ORG MODULES
-- Which modules are enabled for each organization.
-- ============================================================
create table org_modules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  module_id text references modules(id) on delete cascade not null,
  enabled boolean default true,
  enabled_at timestamptz default now(),
  enabled_by uuid references auth.users(id),
  unique(org_id, module_id)
);

create index org_modules_org_id_idx on org_modules(org_id);

alter table org_modules enable row level security;

-- Org members can see which modules are enabled
create policy "org_modules_select"
  on org_modules for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

-- Owners/admins can toggle modules
create policy "org_modules_manage"
  on org_modules for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- MEMBER MODULE ACCESS
-- Individual member opt-in / request access to modules.
-- ============================================================
create table member_module_access (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references auth.users(id) on delete cascade not null,
  org_id uuid references organizations(id) on delete cascade not null,
  module_id text references modules(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'requested', 'revoked')),
  granted_by uuid references auth.users(id),
  granted_at timestamptz,
  requested_at timestamptz default now(),
  unique(member_id, org_id, module_id)
);

create index member_module_access_member_idx on member_module_access(member_id);
create index member_module_access_org_idx on member_module_access(org_id);

alter table member_module_access enable row level security;

-- Users can see their own access
create policy "member_access_own_select"
  on member_module_access for select
  using (member_id = auth.uid());

-- Users can request access (insert)
create policy "member_access_own_insert"
  on member_module_access for insert
  with check (member_id = auth.uid());

-- Owners/admins can manage all access in their org
create policy "member_access_admin_manage"
  on member_module_access for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- MODULE TUTORIALS
-- Step-by-step walkthrough per module.
-- ============================================================
create table module_tutorials (
  id uuid primary key default gen_random_uuid(),
  module_id text references modules(id) on delete cascade not null,
  step_number int not null,
  title text not null,
  content text not null,
  media_url text,
  media_type text check (media_type in ('image', 'video', 'animation')),
  created_at timestamptz default now(),
  unique(module_id, step_number)
);

alter table module_tutorials enable row level security;

create policy "module_tutorials_public_read"
  on module_tutorials for select
  using (true);

-- ============================================================
-- SEED DEFAULT MODULES
-- ============================================================
insert into modules (id, name, description, icon, tier, sort_order) values
  ('advance-sheets', 'Advance Sheets', 'Digital venue questionnaires that auto-generate itineraries', 'FileSpreadsheet', 'free', 1),
  ('itineraries', 'Itineraries', 'Auto-generated daily schedules from advance sheet data', 'Calendar', 'free', 2),
  ('finances', 'Tour Finances', 'Track expenses, revenue, P&L per show and tour', 'DollarSign', 'pro', 3),
  ('show-day', 'Show Day', 'Mobile daily companion — schedule, venue, hotel at a glance', 'Music', 'free', 4),
  ('merch', 'Merch Management', 'Inventory tracking, per-show sales, online store', 'ShoppingBag', 'pro', 5),
  ('fan-engagement', 'Fan Engagement', 'Marketing emails, exclusive content, public event pages', 'Users', 'pro', 6),
  ('community', 'Community', 'Discussion boards and fan interaction', 'MessageCircle', 'pro', 7),
  ('documents', 'Document Hub', 'Contracts, riders, W-9s — organized per tour and show', 'FolderOpen', 'free', 8),
  ('production', 'Production Bible', 'Stage plots, equipment inventory, crew call sheets', 'Wrench', 'pro', 9),
  ('academy', 'Academy', 'Courses and lessons on using the platform', 'GraduationCap', 'free', 10),
  ('wellness', 'Wellness', 'Health and wellbeing tools for life on the road', 'Heart', 'enterprise', 11);
