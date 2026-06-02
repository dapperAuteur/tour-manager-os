-- ============================================================
-- HELP ARTICLE: Tour-exclusive merch drops
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000007',
  'Tour-exclusive merch drops',
  'merch-drops',
  'features',
  '# Tour-exclusive merch drops

A drop is a product that only appears in your public store while a specific tour is running, or inside a fixed date window. Outside that window, fans don''t see it — they don''t even know it exists. Inside, it shows up with a **Tour exclusive** badge and an end date so the urgency is real.

## When to use a drop vs an evergreen product

- **Evergreen** (don''t tick the exclusive box): your standard merch — logo tee, classic vinyl. Always for sale on `/store/<your-org-slug>`.
- **Drop** (tick the exclusive box): tour-specific designs, splatter-vinyl variants, anniversary runs, "available only between these dates" pieces.

If you only want to gate the merch by the tour''s actual run (start date to end date + 1 day), leave the window blank and pick the tour. The storefront automatically hides the drop once the tour''s `end_date` passes.

## How to create one

1. **Add Product** at `/merch/products/new`.
2. Fill in the usual fields (name, price, category, dimensions).
3. Open the **Tour-exclusive drop** section and tick **Limit visibility**.
4. **Tied to tour** — pick the tour the drop is for. Used to badge the product on the storefront. Optional but recommended.
5. **Visible from / Visible until** — datetime range. Leave blank for "exclusive while the tour runs."
6. Save. The drop is live the moment its window opens.

## What fans see

- Drops appear in your `/store/<slug>` storefront with a yellow **Tour exclusive** chip next to the name.
- If you set an end date, the storefront shows *"Only until <date>"* under the title — a real countdown the fan can act on.
- Once the end date or tour end passes, the drop quietly disappears. No 404, no broken link — your evergreen catalog stays clean.

## Pricing + inventory

Drops use the same pricing, cost-basis, and inventory tracking as any other product. Stripe Checkout treats them identically. Shippo rates depend on the dimensions you set on the product, same as evergreen items.

## Try asking the help agent

- "How do I make a tour-exclusive shirt?"
- "Why isn''t my new product showing in the store yet?"
- "Can I run a drop without picking a tour?"
',
  'merch',
  array['merch', 'store', 'drops', 'exclusive', 'tour']
)
on conflict (id) do update
set title = excluded.title,
    slug = excluded.slug,
    category = excluded.category,
    content = excluded.content,
    module_id = excluded.module_id,
    tags = excluded.tags,
    embedding = null,
    embedding_model = null,
    embedded_at = null;
