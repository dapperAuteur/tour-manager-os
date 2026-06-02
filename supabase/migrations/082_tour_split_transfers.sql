-- ============================================================
-- TOUR SPLIT TRANSFERS
-- Audit trail of Stripe Transfer calls executed against a charge
-- on behalf of a tour's revenue-splits config. One row per
-- (payment_intent, split). Idempotency key on (payment_intent_id,
-- split_id) keeps webhook retries from double-paying.
-- ============================================================

create table if not exists tour_split_transfers (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete cascade not null,
  split_id uuid references tour_revenue_splits(id) on delete set null,
  /** Original payment charged on the platform account. */
  payment_intent_id text not null,
  /** Recipient Stripe Connect account id we transferred to. */
  destination_account_id text not null,
  amount_cents int not null check (amount_cents >= 0),
  currency text not null default 'usd',
  /** Stripe Transfer id returned by stripe.transfers.create. */
  stripe_transfer_id text,
  status text not null default 'pending' check (
    status in ('pending', 'succeeded', 'failed', 'skipped')
  ),
  error_message text,
  created_at timestamptz default now(),
  unique (payment_intent_id, split_id)
);

create index if not exists tour_split_transfers_tour_idx
  on tour_split_transfers(tour_id);
create index if not exists tour_split_transfers_payment_intent_idx
  on tour_split_transfers(payment_intent_id);

alter table tour_split_transfers enable row level security;

-- Tour members can read; only the admin client (webhook) writes.
create policy "tour_split_transfers_member_select"
  on tour_split_transfers for select
  using (
    tour_id in (
      select tour_id from tour_members where user_id = auth.uid()
    )
  );

comment on table tour_split_transfers is
  'Audit trail of Stripe Transfers executed against a ticket charge per tour revenue split. Unique on (payment_intent, split) for idempotency.';
