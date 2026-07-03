-- ============================================================
-- VENUE TECH DOCUMENTS
-- ============================================================
-- Lets bands attach the venue's tech pack — sound, lights, video,
-- stage plot, and general house docs — to the venue profile so
-- the whole team can find them before load-in.
--
-- Files live in Cloudinary (raw/auto upload). We store the URL +
-- public_id + metadata here. Mirrors the venue_contacts /
-- venue_stages access model: any authenticated user reads + writes
-- (the venue network is shared across the org).

create table if not exists venue_documents (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venue_profiles(id) on delete cascade not null,
  /** sound / lights / video / stage_plot / other — what the file covers. */
  kind text not null default 'other'
    check (kind in ('sound', 'lights', 'video', 'stage_plot', 'other')),
  title text not null,
  file_url text not null,
  /** Cloudinary public_id so we can delete the asset on row delete. */
  public_id text,
  /** Original file type (application/pdf, text/markdown, text/plain, ...). */
  content_type text,
  bytes int,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table venue_documents enable row level security;

-- Match venue_stages / venue_contacts: any authenticated user reads + writes.
create policy "venue_documents_auth_read"
  on venue_documents for select
  using (auth.uid() is not null);

create policy "venue_documents_auth_manage"
  on venue_documents for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create index if not exists venue_documents_venue_idx
  on venue_documents(venue_id);
