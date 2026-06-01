-- ============================================================
-- Per-show contact override.
--
-- A show normally inherits ALL of its venue's contacts. Sometimes
-- the band uses a different production contact for one specific
-- show (a sub on the way through, a one-off promoter rep, etc.).
-- show_contacts lets you pin specific venue_contacts to a show so
-- the show-day view + advance sheet display the right person.
--
-- Semantics: if a show has zero rows in show_contacts, fall back to
-- ALL of the venue's contacts (current behavior). If it has any
-- rows, ONLY those rows show on the show page.
-- ============================================================

create table if not exists show_contacts (
  show_id uuid references shows(id) on delete cascade not null,
  contact_id uuid references venue_contacts(id) on delete cascade not null,
  /** Optional override of the role (e.g. the booker is acting as production for this one show). */
  role_override text,
  /** Free-form note ("filling in for Jane", "only for VIP comps") shown to crew. */
  note text,
  created_at timestamptz default now(),
  primary key (show_id, contact_id)
);

alter table show_contacts enable row level security;

-- Tours lack an org_id column today (RLS is creator-based), so we
-- match the existing broad venue_contacts policy: any authenticated
-- user. Tighter scoping happens in app code via the tours RLS that
-- already governs which shows the user can read.
create policy "show_contacts_auth_read"
  on show_contacts for select
  using (auth.uid() is not null);

create policy "show_contacts_auth_manage"
  on show_contacts for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create index if not exists show_contacts_show_idx on show_contacts(show_id);
create index if not exists show_contacts_contact_idx on show_contacts(contact_id);
