-- ============================================================
-- Shippo integration prep: ship-from address per org, package
-- dimensions per product, and Shippo identifiers on each order.
-- ============================================================

alter table organizations
  add column if not exists ship_from_name text,
  add column if not exists ship_from_line1 text,
  add column if not exists ship_from_line2 text,
  add column if not exists ship_from_city text,
  add column if not exists ship_from_state text,
  add column if not exists ship_from_postal_code text,
  add column if not exists ship_from_country text,
  add column if not exists ship_from_phone text;

alter table merch_products
  add column if not exists weight_oz numeric(8, 2),
  add column if not exists length_in numeric(6, 2),
  add column if not exists width_in numeric(6, 2),
  add column if not exists height_in numeric(6, 2);

-- Shippo references on each order so we can buy the label after
-- payment succeeds and surface the tracking URL to the band.
alter table merch_orders
  add column if not exists shippo_rate_id text,
  add column if not exists shippo_transaction_id text,
  add column if not exists shippo_label_url text,
  add column if not exists shippo_tracking_url text,
  add column if not exists shipping_carrier text,
  add column if not exists shipping_service text;
