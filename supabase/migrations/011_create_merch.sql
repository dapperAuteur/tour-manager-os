-- ============================================================
-- MERCH PRODUCTS
-- ============================================================
create table merch_products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  sku text,
  category text check (category in ('apparel', 'vinyl', 'cd', 'poster', 'accessory', 'bundle', 'other')),
  price numeric(10,2) not null,
  cost_basis numeric(10,2),
  image_url text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index merch_products_org_id_idx on merch_products(org_id);

create trigger merch_products_updated_at
  before update on merch_products
  for each row execute function extensions.moddatetime(updated_at);

alter table merch_products enable row level security;

create policy "merch_products_org_select"
  on merch_products for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "merch_products_org_manage"
  on merch_products for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- MERCH INVENTORY
-- Track quantities per product. Updated after each sale.
-- ============================================================
create table merch_inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references merch_products(id) on delete cascade not null,
  tour_id uuid references tours(id) on delete set null,
  quantity_start int not null default 0,
  quantity_remaining int not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(product_id, tour_id)
);

create index merch_inventory_product_id_idx on merch_inventory(product_id);
create index merch_inventory_tour_id_idx on merch_inventory(tour_id);

create trigger merch_inventory_updated_at
  before update on merch_inventory
  for each row execute function extensions.moddatetime(updated_at);

alter table merch_inventory enable row level security;

create policy "merch_inventory_select"
  on merch_inventory for select
  using (
    product_id in (
      select id from merch_products
      where org_id in (select org_id from org_members where user_id = auth.uid())
    )
  );

create policy "merch_inventory_manage"
  on merch_inventory for all
  using (
    product_id in (
      select id from merch_products
      where org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin'))
    )
  );

-- ============================================================
-- MERCH SALES
-- Per-show sales records.
-- ============================================================
create table merch_sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references merch_products(id) on delete cascade not null,
  show_id uuid references shows(id) on delete set null,
  tour_id uuid references tours(id) on delete cascade not null,
  quantity int not null,
  unit_price numeric(10,2) not null,
  total numeric(10,2) generated always as (quantity * unit_price) stored,
  sold_by uuid references auth.users(id),
  sold_at timestamptz default now(),
  notes text,
  created_at timestamptz default now()
);

create index merch_sales_product_id_idx on merch_sales(product_id);
create index merch_sales_show_id_idx on merch_sales(show_id);
create index merch_sales_tour_id_idx on merch_sales(tour_id);

alter table merch_sales enable row level security;

create policy "merch_sales_select"
  on merch_sales for select
  using (tour_id in (select get_user_tour_ids()));

create policy "merch_sales_insert"
  on merch_sales for insert
  with check (tour_id in (select get_user_tour_ids()));

create policy "merch_sales_manage"
  on merch_sales for all
  using (tour_id in (select get_user_tour_ids()));
