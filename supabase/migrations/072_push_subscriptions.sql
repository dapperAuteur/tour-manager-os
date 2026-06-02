-- ============================================================
-- WEB PUSH NOTIFICATIONS
-- Per-device push subscription endpoints so we can notify a
-- tour member when their schedule changes, an advance sheet is
-- submitted, or a family-hub poll closes. Each user can register
-- multiple devices; each device has a unique endpoint URL.
-- ============================================================

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  /** Which categories the user opted into on this device. */
  topics text[] default '{schedule_change,advance_submitted,poll_closing}',
  created_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_idx
  on push_subscriptions(user_id);

alter table push_subscriptions enable row level security;

-- A user can only see + manage their own device registrations.
create policy "push_subscriptions_own_select"
  on push_subscriptions for select
  using (user_id = auth.uid());

create policy "push_subscriptions_own_insert"
  on push_subscriptions for insert
  with check (user_id = auth.uid());

create policy "push_subscriptions_own_update"
  on push_subscriptions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "push_subscriptions_own_delete"
  on push_subscriptions for delete
  using (user_id = auth.uid());

comment on table push_subscriptions is
  'Web push device registrations. Send via lib/push/server.ts; admin client bypasses RLS when fanning out.';
