-- ============================================================
-- HELP ARTICLE: Setting up ticketing for a show (Phase 24)
-- The user reported (2026-05-30) that the help agent had no
-- ticketing content. This article walks through creating ticket
-- types, what each field means, and how the buy flow uses them.
-- ============================================================

insert into help_articles (
  id, title, slug, content, category, sort_order, published
) values (
  '80000000-0000-0000-0000-000000000004',
  'Setting up ticketing for a show',
  'ticketing-setup',
  '# Setting up ticketing for a show

Tour Manager OS sells tickets via Stripe Checkout and scans them with HMAC-signed QR codes. Before tickets can be sold for a show, you need at least one **ticket type** on it (e.g. General Admission, VIP, Reserved).

This article covers creating ticket types and what each field means. For the actual buy / scan / refund flows, see related articles: "How tickets are purchased", "Using the door scanner", "Refunds and the ticket lifecycle".

## Quick: create a General Admission ticket type

Today this happens in the Supabase SQL editor (a dedicated form is on the roadmap). The minimum:

```sql
-- 1. Find the show id you want to sell tickets for
SELECT id, date, city, venue_name
FROM shows
ORDER BY date DESC
LIMIT 5;

-- 2. Insert one ticket type. Replace the show_id literal with the
-- UUID from step 1 — keep the single quotes.
INSERT INTO ticket_types (
  show_id, name, category, price, quantity_available, active
) VALUES (
  ''<paste-uuid-here>'',
  ''General Admission'',
  ''general'',
  25.00,
  100,
  true
);
```

The `<paste-uuid-here>` is literal text — replace it with a real id like `0a4c2b91-...`. If you accidentally leave the angle brackets, Postgres returns `22P02 invalid input syntax for type uuid`. (That happened on 2026-05-30; the docs now make this explicit.)

## Field-by-field

- **show_id** — the UUID from `shows.id`. Each ticket type belongs to exactly one show.
- **name** — the customer-facing label on the buy page (e.g. "General Admission", "VIP — Meet & Greet", "Front Row").
- **category** — controls how the ticket is displayed and what badge it carries. Allowed values:
  - `general` — standard floor ticket
  - `vip` — premium tier, badged on the holder page
  - `reserved` — seated, badged accordingly
  - `comp` — $0 ticket. Don''t go through the public buy page; issue directly via the comp flow (Guest List, Phase 25 — coming soon).
- **price** — USD decimal (e.g. `25.00`). Comp tickets use `0`. Don''t price below Stripe''s minimum charge (~$0.50).
- **quantity_available** — the cap. `NULL` means unlimited. The buy endpoint rejects purchases that would push `quantity_sold + qty` above this number, so over-sale is prevented at the database.
- **active** — `true` to list on the public buy page, `false` to hide. Use `false` to soft-disable a tier without deleting it.

## VIP and Reserved examples

```sql
-- VIP with limited quantity
INSERT INTO ticket_types (show_id, name, category, price, quantity_available, active)
VALUES (''<show-id>'', ''VIP Meet & Greet'', ''vip'', 150.00, 20, true);

-- Reserved seating, unlimited
INSERT INTO ticket_types (show_id, name, category, price, quantity_available, active)
VALUES (''<show-id>'', ''Reserved Seating'', ''reserved'', 50.00, NULL, true);
```

## How buyers see them

Once at least one `active` ticket type exists with `price > 0`, the public page at `/shows/<show-id>/tickets` shows:

- A radio-button list of all active types
- Quantity selector (1–10 default; configurable in the buy form)
- Email field (guest checkout supported)
- A Stripe Checkout button that creates a payment session with the right amount

On payment success, the Stripe webhook issues N HMAC-signed tickets and emails QR links to the buyer.

## Common pitfalls

- **`22P02 invalid input syntax for type uuid`** — you left the literal `<show-id>` placeholder in the SQL. Replace with a real UUID.
- **`null value in column "show_id"`** — the show_id you pasted is empty or quoted wrong. Wrap in single quotes: `''0a4c2b91-...''`.
- **Ticket type isn''t showing on the buy page** — check `active = true` and `price > 0`. Comp tickets (`price = 0`) are intentionally hidden from public checkout.
- **"Sold out" but inventory looks wrong** — `quantity_sold` increments on the Stripe webhook (issue path) and decrements on refunds. If the column drifted, recompute from `SELECT COUNT(*) FROM tickets WHERE ticket_type_id = ... AND status != ''refunded''`.

## Disabling a ticket type after launch

```sql
UPDATE ticket_types SET active = false WHERE id = ''<ticket-type-id>'';
```

This hides the type from the buy page immediately. Already-issued tickets keep working — only NEW sales are blocked.

## Related articles

- "Using the door scanner" — how staff scans tickets at the venue
- "Refunds and the ticket lifecycle" — refund through Stripe → tickets flip to ''refunded'' → seats return to inventory

## Roadmap

A web form for creating ticket types (no SQL needed) is on the post-launch list. Until then this SQL approach is the source of truth. See the `/admin/ai` recent activity log if you''re troubleshooting why the agent answered "no information" — it means the relevant article wasn''t embedded yet (run a backfill from `/admin/ai`).',
  'features',
  103,
  true
)
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = now();
