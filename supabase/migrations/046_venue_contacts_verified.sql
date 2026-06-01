-- ============================================================
-- Venue contact verified-flag — band members tap "I called this
-- number, it works" to mark a contact as trusted. Useful when the
-- contact was auto-imported from an advance sheet and nobody has
-- actually used it yet.
-- ============================================================

alter table venue_contacts
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references auth.users(id) on delete set null;

create index if not exists venue_contacts_verified_idx
  on venue_contacts(venue_id)
  where verified_at is not null;
