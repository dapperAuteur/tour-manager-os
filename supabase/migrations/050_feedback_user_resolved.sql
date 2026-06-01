-- ============================================================
-- User-confirmed feedback resolution.
--
-- Today only admins can flip thread status (open → in_progress →
-- resolved → closed). Add columns so the original reporter can
-- confirm "yes this fixed my issue" or "still happening" from the
-- user-facing thread view. Admins see a green "User-confirmed"
-- badge in the admin queue.
-- ============================================================

alter table feedback_threads
  add column if not exists user_resolved_at timestamptz,
  add column if not exists user_resolved_action text
    check (user_resolved_action in ('confirmed_fixed', 'still_happening'));

create index if not exists feedback_threads_user_resolved_idx
  on feedback_threads(user_resolved_at)
  where user_resolved_at is not null;
