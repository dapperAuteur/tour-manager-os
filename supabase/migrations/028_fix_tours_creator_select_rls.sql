-- ============================================================
-- FIX: tours INSERT...RETURNING fails with RLS violation
--
-- Symptom: clients calling `supabase.from('tours').insert({...}).select()`
-- got `42501 new row violates row-level security policy for table "tours"`
-- even when `created_by = auth.uid()`.
--
-- Root cause: the only SELECT policy on tours required the row's id to be
-- in tour_members (via the user's memberships). The auto-add-as-manager
-- AFTER trigger does insert that membership row, but the RETURNING clause's
-- SELECT-RLS check on the just-inserted tour evaluates before the new
-- membership is visible to the user's policy chain — so RETURNING raises
-- 42501. Plain INSERT (no RETURNING) succeeded because the SELECT path
-- isn't traversed.
--
-- Fix: add a SELECT policy letting the creator read tours they own
-- directly. This is also a sound default — the creator should always be
-- able to see their own tour even if the auto-membership trigger ever
-- fails or is removed.
-- ============================================================

create policy "tours_creator_select"
  on tours for select
  using (created_by = auth.uid());
