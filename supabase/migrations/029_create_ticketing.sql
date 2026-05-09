-- ============================================================
-- PHASE 24 — TICKETING SYSTEM
-- Stripe-Checkout-driven ticket purchase, signed-QR generation,
-- and door-side scanning with anti-counterfeit + idempotent check-in.
-- ============================================================

-- ============================================================
-- TICKET TYPES
-- One row per ticket category per show.
-- ============================================================
create table ticket_types (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade not null,
  name text not null,
  category text not null default 'general' check (category in ('general', 'vip', 'reserved', 'comp')),
  price numeric(10,2) not null default 0,
  quantity_available int,
  quantity_sold int not null default 0,
  description text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index ticket_types_show_id_idx on ticket_types(show_id);

create trigger ticket_types_updated_at
  before update on ticket_types
  for each row execute function extensions.moddatetime(updated_at);

alter table ticket_types enable row level security;

create policy "ticket_types_public_select"
  on ticket_types for select
  using (active = true);

create policy "ticket_types_staff_manage"
  on ticket_types for all
  using (
    show_id in (
      select s.id from shows s
      where s.tour_id in (
        select tour_id from tour_members
        where user_id = auth.uid() and role in ('manager', 'crew')
      )
    )
  );

-- ============================================================
-- TICKETS
-- One row per issued ticket. QR carries (id, signature).
-- ============================================================
create table tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_type_id uuid references ticket_types(id) on delete restrict not null,
  show_id uuid references shows(id) on delete cascade not null,
  purchaser_user_id uuid references auth.users(id) on delete set null,
  purchaser_email text not null,
  purchaser_name text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  amount_paid numeric(10,2) not null default 0,
  status text not null default 'issued' check (status in ('issued', 'used', 'refunded', 'void')),
  signature text not null,
  issued_at timestamptz not null default now(),
  used_at timestamptz,
  scanned_by_user_id uuid references auth.users(id),
  scanned_device_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index tickets_show_id_idx on tickets(show_id);
create index tickets_purchaser_user_id_idx on tickets(purchaser_user_id);
create index tickets_purchaser_email_idx on tickets(purchaser_email);
create index tickets_status_idx on tickets(status);
create unique index tickets_stripe_session_unique on tickets(stripe_session_id) where stripe_session_id is not null;

create trigger tickets_updated_at
  before update on tickets
  for each row execute function extensions.moddatetime(updated_at);

alter table tickets enable row level security;

create policy "tickets_purchaser_select"
  on tickets for select
  using (purchaser_user_id = auth.uid());

create policy "tickets_staff_select"
  on tickets for select
  using (
    show_id in (
      select s.id from shows s
      where s.tour_id in (
        select tour_id from tour_members
        where user_id = auth.uid() and role in ('manager', 'crew')
      )
    )
  );

create policy "tickets_staff_update"
  on tickets for update
  using (
    show_id in (
      select s.id from shows s
      where s.tour_id in (
        select tour_id from tour_members
        where user_id = auth.uid() and role in ('manager', 'crew')
      )
    )
  );

-- ============================================================
-- SCAN LOGS
-- Every scan attempt — successful or not — for audit + offline reconciliation.
-- attempted_ticket_id captures the raw id from the QR even when the ticket
-- can't be found (forged or unknown), so we can audit attack attempts.
-- ============================================================
create table scan_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete cascade,
  show_id uuid references shows(id) on delete cascade not null,
  scanned_by_user_id uuid references auth.users(id),
  device_id text,
  result text not null check (result in ('ok', 'already_used', 'invalid_sig', 'wrong_show', 'refunded', 'void', 'not_found')),
  attempted_ticket_id uuid,
  created_at timestamptz default now()
);

create index scan_logs_show_id_idx on scan_logs(show_id);
create index scan_logs_ticket_id_idx on scan_logs(ticket_id);
create index scan_logs_created_at_idx on scan_logs(created_at);

alter table scan_logs enable row level security;

create policy "scan_logs_staff_select"
  on scan_logs for select
  using (
    show_id in (
      select s.id from shows s
      where s.tour_id in (
        select tour_id from tour_members
        where user_id = auth.uid() and role in ('manager', 'crew')
      )
    )
  );

-- Inserts go through the service-role client in the scan API.

-- ============================================================
-- REGISTER TICKETING MODULE
-- ============================================================
insert into modules (id, name, description, icon, tier, sort_order)
values ('ticketing', 'Ticketing', 'Sell tickets with Stripe Checkout, signed-QR codes, and a web-based door scanner', 'Ticket', 'pro', 12)
on conflict (id) do nothing;
