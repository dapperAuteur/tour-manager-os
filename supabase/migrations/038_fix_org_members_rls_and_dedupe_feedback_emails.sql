-- ============================================================
-- FIX: org_members RLS infinite recursion (Bug A — feedback 500)
-- Same shape as the tour_members fix in migration 007: the existing
-- policy queries org_members from inside org_members's RLS check
-- which Postgres detects as infinite recursion (42P17) → 500 on
-- the REST API. Replaced with a SECURITY DEFINER helper.
-- ============================================================

create or replace function get_user_org_ids()
returns setof uuid as $$
  select org_id from public.org_members where user_id = auth.uid()
$$ language sql security definer stable;

drop policy if exists "org_members_select" on org_members;
drop policy if exists "org_members_manage" on org_members;

-- Members can see anyone in orgs they belong to (lets the feedback
-- action's "find my org_id" query work, plus the future org-roster UI).
create policy "org_members_select"
  on org_members for select
  using (org_id in (select get_user_org_ids()));

-- Owners + admins manage memberships in their orgs.
-- For INSERT we can't reference the row's org_id via the helper
-- (it'd let a user join any org by claiming ownership of another
-- org); the simpler form is: user must already be an owner/admin
-- of the target org_id.
create policy "org_members_manage"
  on org_members for all
  using (
    org_id in (
      select om.org_id from public.org_members om
      where om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
    )
  );

-- ============================================================
-- FIX: duplicate admin-reply emails (Bug B)
-- The action sent an email each time it ran. When a Server Action
-- retries (transient error, slow Mailgun call → Vercel function
-- timeout → retry) or an admin double-clicks, the user gets two
-- emails. Adding a message_id column on feedback_notifications with
-- a unique constraint turns the notification insert into the
-- idempotency token: if the notification already exists for that
-- message, skip the email send.
-- ============================================================

alter table feedback_notifications
  add column if not exists message_id uuid references feedback_messages(id) on delete cascade;

-- Existing rows have no message_id — backfill with NULLs is fine;
-- the unique constraint allows multiple NULLs.
create unique index if not exists feedback_notifications_thread_message_unique
  on feedback_notifications(thread_id, message_id)
  where message_id is not null;

-- Helpful for the future per-thread "unread reply" indicator.
create index if not exists feedback_notifications_message_id_idx
  on feedback_notifications(message_id);
