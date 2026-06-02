-- ============================================================
-- HELP ARTICLE: Stripe Connect Transfer execution at ticket sale
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000017',
  'How ticket revenue splits actually pay out',
  'stripe-connect-payouts',
  'features',
  '# How ticket revenue splits actually pay out

The Stripe Connect configuration in `/admin/stripe-connect` plus the
per-tour splits at `/tours/<id>/finances/splits` now route real
money. Every ticket sale that clears triggers an automatic fan-out
of `stripe.transfers.create` against the configured splits.

## When the transfer happens

After a Stripe `checkout.session.completed` event for a ticket:

1. Tickets are issued + emailed to the fan (the existing flow).
2. The webhook looks up `tour_revenue_splits` for the show&rsquo;s
   tour.
3. If the active splits **total exactly 100% (10 000 basis
   points)**, the platform calls `stripe.transfers.create` once
   per split row that carries a `stripe_account_id`.
4. Each call uses `(payment_intent, split)` as its idempotency
   key so a webhook retry never double-pays.

## What gets recorded

Every Transfer attempt writes a row to `tour_split_transfers`:

| Column | Meaning |
| --- | --- |
| `payment_intent_id` | Original Stripe PaymentIntent for the ticket sale |
| `split_id` | The split row this Transfer is paying against |
| `destination_account_id` | Stripe Connect account that received the funds |
| `amount_cents` | What we sent (`amount_total * basis_points / 10 000`) |
| `currency` | Lowercase Stripe currency code |
| `stripe_transfer_id` | The `tr_…` id Stripe returned |
| `status` | `succeeded` / `failed` / `skipped` / `pending` |
| `error_message` | Stripe error text when `status = failed` |

`status = skipped` rows exist for splits that **don&rsquo;t have a
Stripe account attached yet**. The platform tracks the % the band
owes that recipient and the band settles off-platform.

## What gets skipped

The webhook does **not** fan transfers out when:

- The tour&rsquo;s active splits total anything other than exactly
  100% &mdash; we&rsquo;d rather route nothing than route a
  partial allocation. `logError(''stripe.connect.splits_not_100'', …)`
  records the attempt for the audit log; nothing transfers.
- The PaymentIntent has no `latest_charge` yet (race condition with
  Stripe&rsquo;s settlement). The webhook will re-fire and try
  again; idempotency keys make this safe.
- A split row has no `stripe_account_id` &mdash; recorded as
  `skipped` on `tour_split_transfers` so you can still see what
  you owe.

## Reconciling

Open `/tours/<id>/finances/splits` to see the configured rows.
To audit what actually transferred for a given payment, query
`tour_split_transfers` directly &mdash; a UI for this is the
follow-up work.

## What this does not change

- The platform Stripe account still receives the full ticket sale
  first; the band&rsquo;s connected account receives its cut via
  Transfer once the charge settles. Fans see one charge from the
  platform, not multiple.
- Refunds still come out of the platform account. Connect
  reversal-on-refund is the next pass.
- Merch checkout is unchanged &mdash; it doesn&rsquo;t fan out
  yet. Wire `tour_id` into `/api/merch/checkout` metadata when we
  want to add it.

## Try asking the help agent

- "Does my ticket revenue split into the venue&rsquo;s account
  automatically?"
- "What happens when my split totals 90%?"
- "Where do I see which Stripe transfers happened for a show?"
',
  'finances',
  array['ticketing', 'stripe-connect', 'splits', 'transfers', 'finances']
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
