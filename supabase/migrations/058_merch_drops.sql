-- ============================================================
-- TOUR-EXCLUSIVE MERCH DROPS
-- A drop is a product whose visibility is gated to a specific tour
-- and an optional date window. Outside the window the storefront
-- hides the product; inside, it appears with a "tour exclusive"
-- badge. Non-exclusive products keep their existing always-on
-- behaviour — this is purely additive.
-- ============================================================

alter table merch_products
  add column if not exists is_exclusive boolean default false,
  add column if not exists drop_tour_id uuid references tours(id) on delete set null,
  add column if not exists drop_starts_at timestamptz,
  add column if not exists drop_ends_at timestamptz;

create index if not exists merch_products_drop_window_idx
  on merch_products (is_exclusive, drop_starts_at, drop_ends_at)
  where is_exclusive = true;

create index if not exists merch_products_drop_tour_idx
  on merch_products (drop_tour_id)
  where drop_tour_id is not null;

comment on column merch_products.is_exclusive is
  'When true, the product only shows in the public store between drop_starts_at and drop_ends_at (or always if those are null).';
comment on column merch_products.drop_tour_id is
  'Optional tour the drop is tied to. Used to badge the product and to scope inventory.';
