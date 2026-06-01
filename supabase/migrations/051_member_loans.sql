-- ============================================================
-- Member-to-member loan ledger.
--
-- "Drummer borrowed $5 from guitarist for parking" — both members
-- need to track who owes whom across the tour. Lives separately from
-- `expenses` (which feed tour P&L); loans are personal IOUs that
-- don't affect the band's bottom line.
-- ============================================================

create table if not exists member_loans (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete cascade,
  lender_id uuid references auth.users(id) on delete cascade not null,
  borrower_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12, 2) not null check (amount > 0),
  reason text,
  status text not null default 'open' check (status in ('open', 'paid')),
  paid_at timestamptz,
  paid_method text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  check (lender_id <> borrower_id)
);

alter table member_loans enable row level security;

-- Either party (lender or borrower) can see the loan. The creator —
-- whoever typed it in — counts too.
create policy "member_loans_party_read"
  on member_loans for select
  using (
    lender_id = auth.uid()
    or borrower_id = auth.uid()
    or created_by = auth.uid()
  );

-- Either party can create a loan; both have skin in the game.
create policy "member_loans_party_insert"
  on member_loans for insert
  with check (
    created_by = auth.uid()
    and (lender_id = auth.uid() or borrower_id = auth.uid())
  );

-- Either party can mark it paid (lender confirms repayment;
-- borrower can also self-record).
create policy "member_loans_party_update"
  on member_loans for update
  using (lender_id = auth.uid() or borrower_id = auth.uid())
  with check (lender_id = auth.uid() or borrower_id = auth.uid());

-- Only the creator can delete an open loan (cleanup for typos).
create policy "member_loans_creator_delete"
  on member_loans for delete
  using (created_by = auth.uid() and status = 'open');

create index if not exists member_loans_lender_idx
  on member_loans(lender_id, status);
create index if not exists member_loans_borrower_idx
  on member_loans(borrower_id, status);
create index if not exists member_loans_tour_idx
  on member_loans(tour_id);
