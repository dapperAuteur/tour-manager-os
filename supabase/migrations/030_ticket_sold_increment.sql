-- ============================================================
-- Atomic increment of ticket_types.quantity_sold
-- Used by the Stripe webhook when issuing tickets after checkout —
-- avoids the read-then-write race when two purchases settle near-
-- simultaneously for the same ticket type.
-- ============================================================
create or replace function public.increment_ticket_sold(_id uuid, _n int)
returns void
language sql
security definer
as $$
  update public.ticket_types
     set quantity_sold = quantity_sold + _n
   where id = _id
$$;

revoke all on function public.increment_ticket_sold(uuid, int) from public;
grant execute on function public.increment_ticket_sold(uuid, int) to service_role;
