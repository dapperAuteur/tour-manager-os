-- ============================================================
-- PHASE 24.5 — FAN PHOTO SHARING
-- Ticket-holders submit show photos. Pre-moderated by tour staff
-- before they appear on the public per-show wall.
-- ============================================================

-- Eligibility helper: a user can post photos for a show iff they hold
-- a non-refunded ticket for that show. SECURITY DEFINER so RLS on
-- tickets doesn't gate the existence check when called from another
-- table's policy (avoids recursion + ensures we count the user's own
-- ticket even if they're querying as anon).
create or replace function public.can_post_photos_for_show(_uid uuid, _show_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.tickets
    where purchaser_user_id = _uid
      and show_id = _show_id
      and status in ('issued', 'used')
  );
$$;

revoke all on function public.can_post_photos_for_show(uuid, uuid) from public;
grant execute on function public.can_post_photos_for_show(uuid, uuid) to anon, authenticated, service_role;

-- ============================================================
-- FAN PHOTOS
-- ============================================================
create table fan_photos (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references shows(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  cloudinary_public_id text not null,
  cloudinary_url text not null,
  width int,
  height int,
  caption text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'removed')),
  submitted_at timestamptz not null default now(),
  moderated_by_user_id uuid references auth.users(id),
  moderated_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index fan_photos_show_id_idx on fan_photos(show_id);
create index fan_photos_user_id_idx on fan_photos(user_id);
create index fan_photos_status_idx on fan_photos(status);
create index fan_photos_show_status_idx on fan_photos(show_id, status);

create trigger fan_photos_updated_at
  before update on fan_photos
  for each row execute function extensions.moddatetime(updated_at);

alter table fan_photos enable row level security;

-- Public reads approved photos (the per-show wall).
create policy "fan_photos_approved_public_select"
  on fan_photos for select
  using (status = 'approved');

-- Poster reads their own posts in any status (sees their pending +
-- rejected + reason on the fan dashboard).
create policy "fan_photos_own_select"
  on fan_photos for select
  using (user_id = auth.uid());

-- Tour staff reads every status for shows on their tours (moderation
-- queue + audit).
create policy "fan_photos_staff_select"
  on fan_photos for select
  using (
    show_id in (
      select s.id from shows s
      where s.tour_id in (
        select tour_id from tour_members
        where user_id = auth.uid() and role in ('manager', 'crew')
      )
    )
  );

-- A ticket-holder can submit photos for that show. Server-side check
-- mirrors this in the upload route for defense in depth.
create policy "fan_photos_holder_insert"
  on fan_photos for insert
  with check (
    user_id = auth.uid()
    and can_post_photos_for_show(auth.uid(), show_id)
  );

-- Tour staff can moderate (approve / reject / remove).
create policy "fan_photos_staff_update"
  on fan_photos for update
  using (
    show_id in (
      select s.id from shows s
      where s.tour_id in (
        select tour_id from tour_members
        where user_id = auth.uid() and role in ('manager', 'crew')
      )
    )
  );

-- Poster can delete their own pending submission (changed their mind).
-- Once approved, only staff can remove.
create policy "fan_photos_own_delete_pending"
  on fan_photos for delete
  using (user_id = auth.uid() and status = 'pending');

create policy "fan_photos_staff_delete"
  on fan_photos for delete
  using (
    show_id in (
      select s.id from shows s
      where s.tour_id in (
        select tour_id from tour_members
        where user_id = auth.uid() and role in ('manager', 'crew')
      )
    )
  );

-- ============================================================
-- FAN PHOTO REPORTS
-- Post-publish abuse reports. Lightweight even with pre-moderation,
-- since approved photos can still be flagged later.
-- ============================================================
create table fan_photo_reports (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references fan_photos(id) on delete cascade not null,
  reporter_user_id uuid references auth.users(id) on delete set null,
  reason text not null check (length(reason) > 0 and length(reason) <= 500),
  status text not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'dismissed')),
  resolved_by_user_id uuid references auth.users(id),
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz default now()
);

create index fan_photo_reports_photo_id_idx on fan_photo_reports(photo_id);
create index fan_photo_reports_status_idx on fan_photo_reports(status);

alter table fan_photo_reports enable row level security;

-- Reporters see their own reports.
create policy "fan_photo_reports_own_select"
  on fan_photo_reports for select
  using (reporter_user_id = auth.uid());

-- Tour staff see all reports for photos of their shows.
create policy "fan_photo_reports_staff_select"
  on fan_photo_reports for select
  using (
    photo_id in (
      select fp.id from fan_photos fp
      join shows s on s.id = fp.show_id
      where s.tour_id in (
        select tour_id from tour_members
        where user_id = auth.uid() and role in ('manager', 'crew')
      )
    )
  );

-- Anyone authed can file a report against an approved photo.
create policy "fan_photo_reports_insert"
  on fan_photo_reports for insert
  with check (
    reporter_user_id = auth.uid()
    and photo_id in (select id from fan_photos where status = 'approved')
  );

-- Staff resolve reports.
create policy "fan_photo_reports_staff_update"
  on fan_photo_reports for update
  using (
    photo_id in (
      select fp.id from fan_photos fp
      join shows s on s.id = fp.show_id
      where s.tour_id in (
        select tour_id from tour_members
        where user_id = auth.uid() and role in ('manager', 'crew')
      )
    )
  );

-- ============================================================
-- REGISTER FAN-PHOTOS MODULE
-- ============================================================
insert into modules (id, name, description, icon, tier, sort_order)
values ('fan-photos', 'Fan Photos', 'Ticket-holders share show photos. Pre-moderated wall, fan dashboard, and per-photo public share links', 'Image', 'pro', 13)
on conflict (id) do nothing;
