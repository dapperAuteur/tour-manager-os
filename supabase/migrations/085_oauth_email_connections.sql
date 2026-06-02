-- ============================================================
-- OAUTH EMAIL CONNECTIONS
-- One row per user per provider. Stores the OAuth access + refresh
-- tokens we need to send email from the user's own mailbox so
-- replies go to their inbox and the message appears in their Sent
-- folder. Today: Gmail only. Outlook scaffolding is identical
-- modulo the provider column.
-- ============================================================

create table if not exists oauth_email_connections (
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null check (provider in ('gmail', 'outlook')),
  email_address text not null,
  access_token text not null,
  refresh_token text not null,
  scopes text[],
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, provider)
);

create index if not exists oauth_email_connections_user_idx
  on oauth_email_connections(user_id);

alter table oauth_email_connections enable row level security;

-- Each user can only see / mutate their own connection. The server
-- uses the admin client when it needs to read tokens for sending
-- (RLS bypass is intentional there).
create policy "oauth_email_connections_own_select"
  on oauth_email_connections for select
  using (user_id = auth.uid());

create policy "oauth_email_connections_own_insert"
  on oauth_email_connections for insert
  with check (user_id = auth.uid());

create policy "oauth_email_connections_own_update"
  on oauth_email_connections for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "oauth_email_connections_own_delete"
  on oauth_email_connections for delete
  using (user_id = auth.uid());

create or replace trigger oauth_email_connections_updated_at
  before update on oauth_email_connections
  for each row execute function extensions.moddatetime(updated_at);

comment on table oauth_email_connections is
  'OAuth tokens for sending email through the user''s own Gmail/Outlook mailbox so replies land in their inbox and outbound shows in Sent.';
