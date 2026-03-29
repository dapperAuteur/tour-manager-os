-- ============================================================
-- API KEYS
-- Per-organization API keys for third-party integrations.
-- ============================================================
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  key_prefix text not null,  -- first 8 chars for display (e.g., "tm_live_a1b2...")
  key_hash text not null,    -- bcrypt hash of the full key
  scopes jsonb default '["read"]',  -- ["read", "write", "tours", "shows", "finances"]
  rate_limit int default 1000,  -- requests per hour
  last_used_at timestamptz,
  expires_at timestamptz,
  active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index api_keys_org_id_idx on api_keys(org_id);
create index api_keys_key_prefix_idx on api_keys(key_prefix);

alter table api_keys enable row level security;

create policy "api_keys_org_select"
  on api_keys for select
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

create policy "api_keys_org_manage"
  on api_keys for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- API LOGS
-- Request logs for rate limiting and analytics.
-- ============================================================
create table api_logs (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id) on delete set null,
  method text not null,
  path text not null,
  status_code int,
  response_time_ms int,
  ip_address text,
  created_at timestamptz default now()
);

create index api_logs_key_id_idx on api_logs(api_key_id);
create index api_logs_created_at_idx on api_logs(created_at desc);

alter table api_logs enable row level security;

-- Only accessible via admin client

-- ============================================================
-- WEBHOOKS
-- Org-configured webhook endpoints.
-- ============================================================
create table webhooks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  url text not null,
  events jsonb default '[]',  -- ["show.created", "advance_sheet.completed", "expense.created"]
  secret_hash text,
  active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index webhooks_org_id_idx on webhooks(org_id);

create trigger webhooks_updated_at
  before update on webhooks
  for each row execute function extensions.moddatetime(updated_at);

alter table webhooks enable row level security;

create policy "webhooks_org_select"
  on webhooks for select
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

create policy "webhooks_org_manage"
  on webhooks for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));
