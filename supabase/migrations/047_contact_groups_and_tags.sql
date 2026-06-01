-- ============================================================
-- Venue-contact visibility groups + per-contact tags.
--
-- Tags (text[]) are simple labels on a single contact ("handles VIP
-- comps", "load-in lead") so the band knows who to call for what.
--
-- Groups give the team account manager a way to restrict who on the
-- band can see specific contacts. Default is the same as today:
-- contacts in NO group are visible to everyone. Contacts added to a
-- group are visible only to the org members the group owner shares
-- it with (plus org owners/admins, always).
-- ============================================================

alter table venue_contacts
  add column if not exists tags text[] not null default '{}';

-- Groups are scoped to an org. Created by an org member, edited by
-- the creator or any org owner/admin.
create table if not exists contact_groups (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique(org_id, name)
);

alter table contact_groups enable row level security;

create policy "contact_groups_org_read"
  on contact_groups for select
  using (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );

create policy "contact_groups_org_write"
  on contact_groups for insert
  with check (
    org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
    and created_by = auth.uid()
  );

create policy "contact_groups_owner_update"
  on contact_groups for update
  using (
    created_by = auth.uid()
    or org_id in (
      select org_id from org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "contact_groups_owner_delete"
  on contact_groups for delete
  using (
    created_by = auth.uid()
    or org_id in (
      select org_id from org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Group membership.
create table if not exists contact_group_members (
  group_id uuid references contact_groups(id) on delete cascade not null,
  contact_id uuid references venue_contacts(id) on delete cascade not null,
  added_at timestamptz default now(),
  primary key (group_id, contact_id)
);

alter table contact_group_members enable row level security;

create policy "contact_group_members_org_read"
  on contact_group_members for select
  using (
    group_id in (
      select id from contact_groups
      where org_id in (
        select org_id from org_members where user_id = auth.uid()
      )
    )
  );

create policy "contact_group_members_org_write"
  on contact_group_members for all
  using (
    group_id in (
      select id from contact_groups
      where org_id in (
        select org_id from org_members where user_id = auth.uid()
      )
    )
  )
  with check (
    group_id in (
      select id from contact_groups
      where org_id in (
        select org_id from org_members where user_id = auth.uid()
      )
    )
  );

-- Per-user visibility. Empty list = visible only to org owners/admins
-- (creator can always see their own groups).
create table if not exists contact_group_visibility (
  group_id uuid references contact_groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (group_id, user_id)
);

alter table contact_group_visibility enable row level security;

create policy "contact_group_visibility_org_read"
  on contact_group_visibility for select
  using (
    group_id in (
      select id from contact_groups
      where org_id in (
        select org_id from org_members where user_id = auth.uid()
      )
    )
  );

create policy "contact_group_visibility_org_write"
  on contact_group_visibility for all
  using (
    group_id in (
      select id from contact_groups
      where org_id in (
        select org_id from org_members where user_id = auth.uid()
      )
    )
  )
  with check (
    group_id in (
      select id from contact_groups
      where org_id in (
        select org_id from org_members where user_id = auth.uid()
      )
    )
  );

create index if not exists contact_group_members_contact_idx
  on contact_group_members(contact_id);
create index if not exists contact_group_visibility_user_idx
  on contact_group_visibility(user_id);
create index if not exists venue_contacts_tags_idx
  on venue_contacts using gin(tags);

-- ============================================================
-- Helper: returns true if the current user is allowed to see a
-- particular contact. App code uses this to filter; RLS on
-- venue_contacts stays broad to avoid breaking the wider read flow.
-- ============================================================
-- Batch version: filters a list of contact ids to those the current
-- user is allowed to see. Cheaper than calling user_can_see_contact
-- per row from the app.
create or replace function filter_visible_contacts(contact_ids uuid[])
returns table(id uuid)
language sql
security definer
set search_path = public
as $$
  select c
  from unnest(contact_ids) as c
  where user_can_see_contact(c)
$$;

create or replace function user_can_see_contact(contact uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    -- (a) Contact is not in any group → visible to everyone.
    not exists (
      select 1 from contact_group_members where contact_id = contact
    )
    or
    -- (b) Current user is an org owner/admin of an org that owns one of
    -- those groups.
    exists (
      select 1
      from contact_group_members cgm
      join contact_groups cg on cg.id = cgm.group_id
      join org_members om
        on om.org_id = cg.org_id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
      where cgm.contact_id = contact
    )
    or
    -- (c) Current user is the creator of one of the groups containing it.
    exists (
      select 1
      from contact_group_members cgm
      join contact_groups cg on cg.id = cgm.group_id
      where cgm.contact_id = contact
      and cg.created_by = auth.uid()
    )
    or
    -- (d) Current user is listed in visibility of one of those groups.
    exists (
      select 1
      from contact_group_members cgm
      join contact_group_visibility cgv on cgv.group_id = cgm.group_id
      where cgm.contact_id = contact
      and cgv.user_id = auth.uid()
    )
$$;
