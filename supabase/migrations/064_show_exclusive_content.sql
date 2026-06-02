-- ============================================================
-- PRE/POST-SHOW EXCLUSIVE CONTENT
-- Per-show content that unlocks for fans on the band's email list
-- inside a time window relative to show start. Pre-show content
-- typically drops 24-72 hours before doors (acoustic preview, setlist
-- hint, after-party RSVP). Post-show content drops after stage time
-- (thank-you note, soundboard rip, behind-the-scenes photo).
-- ============================================================

create table if not exists show_exclusive_content (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade not null,
  org_id uuid references organizations(id) on delete cascade not null,
  phase text not null check (phase in ('pre', 'post')),
  /**
   * Offset in hours from show date midnight (local). For pre-show this
   * is the unlock_window start (e.g. -48 = unlocks 2 days early). For
   * post-show it's when the content goes live (e.g. 6 = 6 hours after
   * midnight on show day, which is roughly post-headliner).
   */
  unlock_offset_hours int not null default 0,
  title text not null,
  body text,
  media_url text,
  call_to_action_label text,
  call_to_action_url text,
  active boolean default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists show_exclusive_content_show_idx
  on show_exclusive_content(show_id);
create index if not exists show_exclusive_content_org_phase_idx
  on show_exclusive_content(org_id, phase) where active = true;

alter table show_exclusive_content enable row level security;

-- Public read: gate is at the application layer (email match + time
-- window). RLS just ensures inserts/updates stay within the org.
create policy "show_exclusive_content_public_select_active"
  on show_exclusive_content for select
  using (active = true);

create policy "show_exclusive_content_org_manage"
  on show_exclusive_content for all
  using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  )
  with check (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

create or replace trigger show_exclusive_content_updated_at
  before update on show_exclusive_content
  for each row execute function extensions.moddatetime(updated_at);

comment on table show_exclusive_content is
  'Pre- and post-show content that unlocks for fans on the band email list inside a time window relative to show start.';
