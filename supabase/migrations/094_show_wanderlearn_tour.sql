-- ============================================================
-- SHOW WANDERLEARN VIRTUAL TOUR
-- ============================================================
-- Lets a band attach a WanderLearn 360 virtual tour to a show.
-- The public event page then embeds it so fans get a virtual /
-- behind-the-scenes experience of the room.
--
-- We store only the embed src URL (e.g.
-- https://wanderlearn.witus.online/embed/tours/<slug>). The app
-- validates the host against an allowlist before saving, and the
-- public page renders its OWN <iframe src=...> — never the raw
-- pasted markup — so this stays safe against injected HTML.

alter table shows
  add column if not exists wanderlearn_url text;

comment on column shows.wanderlearn_url is
  'WanderLearn embed src URL for this show; null when none. Host is allowlisted at write time.';
