-- ============================================================
-- Cross-act messaging: a single channel per tour package where each
-- act (headliner + supports + openers + guests) can coordinate.
--
-- Sender records their org_id so we can show "from <Band Name>" even
-- after the org renames. sender_act_id (optional) ties the message
-- to a specific act in the package_acts roster — useful when one org
-- has multiple acts at the festival.
-- ============================================================

create table if not exists package_messages (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references tour_packages(id) on delete cascade not null,
  sender_user_id uuid references auth.users(id) on delete set null,
  /** Optional: which package act the sender is representing. */
  sender_act_id uuid references package_acts(id) on delete set null,
  /** Snapshot of the sender's display name at send time. */
  sender_name text,
  /** Snapshot of the act name (or band name) for the post header. */
  sender_act_label text,
  body text not null check (length(body) > 0 and length(body) <= 4000),
  created_at timestamptz default now(),
  edited_at timestamptz
);

alter table package_messages enable row level security;

-- Match the broad pattern used elsewhere in this schema: any
-- authenticated user can read + insert. Tighter scoping (limit to
-- members of an act in this package) can come later if needed.
create policy "package_messages_auth_read"
  on package_messages for select
  using (auth.uid() is not null);

create policy "package_messages_auth_insert"
  on package_messages for insert
  with check (sender_user_id = auth.uid());

create policy "package_messages_self_update"
  on package_messages for update
  using (sender_user_id = auth.uid())
  with check (sender_user_id = auth.uid());

create policy "package_messages_self_delete"
  on package_messages for delete
  using (sender_user_id = auth.uid());

create index if not exists package_messages_package_idx
  on package_messages(package_id, created_at desc);
