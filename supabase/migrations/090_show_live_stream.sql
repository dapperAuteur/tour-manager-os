-- ============================================================
-- SHOW LIVE STREAM FLAG
-- ============================================================
-- Adds a boolean toggle so the tour team can mark a show as
-- "streaming right now." When on, the public event page renders
-- the platform Viloud embed. When off (default), the section
-- stays hidden.
--
-- The stream URL + embed code themselves are platform env vars
-- (RTMP_STREAM_PLAYBACK_URL + STREAM_EMBED_CODE). We do not store
-- them per row because the platform holds one Viloud account.
-- Down the road we can split per-tour if a band brings their own.

alter table shows
  add column if not exists stream_live boolean not null default false,
  add column if not exists stream_started_at timestamptz;

comment on column shows.stream_live is
  'When true, the public event page renders the platform live-stream embed.';
comment on column shows.stream_started_at is
  'Timestamp we flipped stream_live on; nulled when it flips off.';

-- Index so the "any show live right now" query on the marketing
-- dashboard stays cheap.
create index if not exists shows_stream_live_idx
  on shows(stream_live)
  where stream_live = true;
