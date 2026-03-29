-- ============================================================
-- WHITE LABEL CONFIG
-- Per-organization branding and custom domain settings.
-- Extends the existing organizations table.
-- ============================================================

-- Add white label columns to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS brand_name text,
  ADD COLUMN IF NOT EXISTS brand_tagline text,
  ADD COLUMN IF NOT EXISTS brand_logo_url text,
  ADD COLUMN IF NOT EXISTS brand_favicon_url text,
  ADD COLUMN IF NOT EXISTS brand_primary_color text DEFAULT '#4553ea',
  ADD COLUMN IF NOT EXISTS brand_font text DEFAULT 'Inter',
  ADD COLUMN IF NOT EXISTS custom_css text,
  ADD COLUMN IF NOT EXISTS white_label_enabled boolean DEFAULT false;

-- ============================================================
-- CUSTOM DOMAINS
-- Map custom domains to organizations.
-- ============================================================
create table custom_domains (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  domain text unique not null,
  verified boolean default false,
  verification_token text,
  ssl_provisioned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index custom_domains_org_id_idx on custom_domains(org_id);
create index custom_domains_domain_idx on custom_domains(domain);

create trigger custom_domains_updated_at
  before update on custom_domains
  for each row execute function extensions.moddatetime(updated_at);

alter table custom_domains enable row level security;

create policy "custom_domains_org_select"
  on custom_domains for select
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

create policy "custom_domains_org_manage"
  on custom_domains for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role = 'owner'));
