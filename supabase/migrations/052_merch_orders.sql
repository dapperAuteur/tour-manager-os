-- ============================================================
-- Online merch store: fan-facing purchases via Stripe Checkout.
--
-- Flow: fan opens /store/[org-slug] → picks a product → server
-- creates a Stripe Checkout session with the product's price → on
-- successful payment, our webhook gets `checkout.session.completed`
-- and inserts a row into `merch_orders` + `merch_order_items`.
--
-- Inventory is decremented at fulfillment time (not at checkout),
-- since Stripe handles oversells via session reservation timeouts.
-- ============================================================

create table if not exists merch_orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  /** Public-facing short id for "thanks for your order #ABC-1234" emails. */
  order_number text not null unique,
  fan_email text not null,
  fan_name text,
  shipping_address jsonb,
  items_total numeric(12, 2) not null,
  shipping_cost numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null,
  currency text not null default 'usd',
  status text not null default 'paid' check (status in ('paid', 'fulfilled', 'refunded', 'cancelled')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  tracking_number text,
  fulfilled_at timestamptz,
  fulfillment_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table merch_orders enable row level security;

-- Read by org admins/owners; webhook inserts via service role (bypasses RLS).
create policy "merch_orders_org_read"
  on merch_orders for select
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "merch_orders_org_update"
  on merch_orders for update
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  )
  with check (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create index if not exists merch_orders_org_idx on merch_orders(org_id, created_at desc);
create index if not exists merch_orders_status_idx on merch_orders(status);

create table if not exists merch_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references merch_orders(id) on delete cascade not null,
  product_id uuid references merch_products(id) on delete set null,
  /** Snapshot of the product name + price at purchase time so order
      history stays correct even if the catalog changes later. */
  product_name text not null,
  unit_price numeric(10, 2) not null,
  quantity int not null check (quantity > 0),
  subtotal numeric(12, 2) not null
);

alter table merch_order_items enable row level security;

create policy "merch_order_items_via_order"
  on merch_order_items for select
  using (
    order_id in (
      select id from merch_orders
      where org_id in (
        select org_id from org_members
        where user_id = auth.uid() and role in ('owner', 'admin')
      )
    )
  );

create index if not exists merch_order_items_order_idx on merch_order_items(order_id);

-- Updated-at trigger so admins can sort the queue by recent activity.
create or replace trigger merch_orders_updated_at
  before update on merch_orders
  for each row execute function extensions.moddatetime(updated_at);
