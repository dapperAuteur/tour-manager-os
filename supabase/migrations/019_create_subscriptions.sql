-- ============================================================
-- SUBSCRIPTIONS
-- Tracks lifetime and annual purchases per user.
-- ============================================================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  org_id uuid references organizations(id) on delete set null,
  type text not null check (type in ('lifetime', 'annual')),
  status text not null default 'active' check (status in ('active', 'past_due', 'cancelled', 'expired')),
  stripe_subscription_id text,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  amount numeric(10,2) not null,
  promo_code_id uuid,
  started_at timestamptz default now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index subscriptions_user_id_idx on subscriptions(user_id);
create index subscriptions_type_idx on subscriptions(type);
create index subscriptions_status_idx on subscriptions(status);

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function extensions.moddatetime(updated_at);

alter table subscriptions enable row level security;

create policy "subscriptions_own_select"
  on subscriptions for select
  using (user_id = auth.uid());

-- ============================================================
-- PROMO CODES
-- Admin-created promotional codes for discounts.
-- ============================================================
create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null,
  applies_to text not null default 'all' check (applies_to in ('all', 'lifetime', 'annual')),
  max_uses int,
  times_used int default 0,
  is_lifetime_grant boolean default false,
  active boolean default true,
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index promo_codes_code_idx on promo_codes(code);

alter table promo_codes enable row level security;

-- Everyone can validate a promo code
create policy "promo_codes_public_read"
  on promo_codes for select
  using (true);

-- ============================================================
-- LIFETIME SALES COUNTER VIEW
-- ============================================================
create or replace view lifetime_sales_stats as
select
  count(*) filter (where type = 'lifetime' and status = 'active') as paid_lifetime_count,
  count(*) filter (where type = 'annual' and status = 'active') as active_annual_count,
  coalesce(sum(amount) filter (where status = 'active'), 0) as total_revenue,
  100 - count(*) filter (where type = 'lifetime' and status = 'active') as lifetime_remaining
from subscriptions;
