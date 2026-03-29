-- ============================================================
-- FIX: tour_members RLS infinite recursion
--
-- The SELECT policy on tour_members queried tour_members itself,
-- causing infinite recursion. Fix: use a SECURITY DEFINER function
-- to get the user's tour IDs without triggering RLS.
-- ============================================================

-- Helper function: returns tour_ids for the current user.
-- SECURITY DEFINER bypasses RLS on tour_members, breaking the recursion.
create or replace function get_user_tour_ids()
returns setof uuid as $$
  select tour_id from public.tour_members where user_id = auth.uid()
$$ language sql security definer stable;

-- Drop ALL old tour_members policies
drop policy if exists "tour_members_select" on tour_members;
drop policy if exists "tour_members_select_team" on tour_members;
drop policy if exists "tour_members_insert" on tour_members;
drop policy if exists "tour_members_update" on tour_members;
drop policy if exists "tour_members_delete" on tour_members;

-- SELECT: use the helper function (no recursion)
create policy "tour_members_select"
  on tour_members for select
  using (tour_id in (select get_user_tour_ids()));

-- INSERT: managers can add members (write policies don't trigger select recursion)
create policy "tour_members_insert"
  on tour_members for insert
  with check (
    tour_id in (select get_user_tour_ids())
  );

-- UPDATE: managers can update members
create policy "tour_members_update"
  on tour_members for update
  using (
    tour_id in (select get_user_tour_ids())
  );

-- DELETE: managers can remove members
create policy "tour_members_delete"
  on tour_members for delete
  using (
    tour_id in (select get_user_tour_ids())
  );
