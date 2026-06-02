-- ============================================================
-- HELP ARTICLE: Stripe Connect split payments
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000015',
  'Splitting ticket revenue across artist, venue, and crew',
  'stripe-connect-splits',
  'features',
  '# Splitting ticket revenue across artist, venue, and crew

Every ticket sale on Tour Manager OS currently lands in the
platform Stripe account. The artist takes their cut, the venue
takes theirs, and the crew gets paid — but it&rsquo;s all done by
hand after the show. Stripe Connect changes that: you configure
the splits once per tour, the platform routes the payouts
automatically.

## Two pieces

There are two pieces to set up, in order:

1. **Per-org Stripe Express account** at `/admin/stripe-connect`.
   This is the destination Stripe routes the band&rsquo;s share to.
2. **Per-tour revenue splits** at
   `/tours/<tour-id>/finances/splits`. This is the percentage
   allocation across artist, venue, and crew payees for one tour.

Each split row can optionally carry its own `stripe_account_id` so
the venue and crew can also get direct payouts. Rows without a
Stripe account stay informational — the platform still tracks the
allocation but the band settles those off-platform.

## Setup walkthrough

### 1. Enable Stripe Connect on your platform Stripe account

Before any of this works, Stripe Connect must be enabled on the
platform Stripe account. This is a one-time operator task (see
`plans/user-tasks/31-enable-stripe-connect.md`). Until then, the
**Start onboarding** button will fail with a Stripe error message.

### 2. Onboard the band

1. Open `/admin/stripe-connect`.
2. Click **Start onboarding**. You&rsquo;ll be redirected to a
   Stripe-hosted form that collects business identity, bank
   account, and tax info.
3. When you return, click **Refresh status**. The page will show
   green checkmarks once charges + payouts are enabled.

### 3. Configure splits per tour

1. Open `/tours/<tour-id>/finances` and click **Revenue splits**.
2. Click **Add split**. Pick a tour member, set their percentage,
   tag a role (artist / venue / crew is conventional), and
   optionally paste the recipient&rsquo;s `acct_…` Stripe account
   id.
3. Repeat until the total hits 100%. The gauge at the top of the
   page turns green when totals match.
4. Partial drafts are fine — the platform refuses to route splits
   for a tour until totals equal exactly 100%.

## What ships today vs. later

- **Today:** schema + Express onboarding + per-tour allocation UI
  + the platform Stripe accounts the bands need to receive payouts.
- **Next pass:** wire `stripe.transfers.create` calls into the
  ticket + merch payment flow so the splits actually route money
  the moment a sale clears. Until that lands, splits are
  informational — the platform Stripe account still receives 100%
  of payments and the band settles internally.

## Why basis points

Internally the split percentages are stored in **basis points**
(1/100th of a percent). 1% = 100 basis points; 100% = 10000. This
mirrors how Stripe handles fee splits and avoids floating-point
rounding when we eventually call `application_fee_amount` against
real cents.

## Try asking the help agent

- "How do I split ticket revenue with the venue?"
- "Where do I onboard my band&rsquo;s Stripe account?"
- "Why does the split total need to equal exactly 100%?"
',
  'finances',
  array['ticketing', 'stripe-connect', 'splits', 'finances']
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
