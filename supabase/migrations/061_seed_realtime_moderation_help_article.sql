-- ============================================================
-- HELP ARTICLE: Realtime fan-photo moderation queue
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000008',
  'Moderating fan photos in real time',
  'fan-photo-realtime-moderation',
  'features',
  '# Moderating fan photos in real time

When fans submit a photo for a show, it lands in the moderation queue at
`/tours/<tour-id>/shows/<show-id>/fan-photos`. Until you approve it, the
photo doesn''t appear on the public wall. The queue now updates live —
no manual refresh required during the show.

## What "live" means

- The page opens a Supabase Realtime channel scoped to that single show''s
  fan photos. As soon as a new photo is inserted or any photo''s status
  changes, the queue refreshes within about 600 milliseconds.
- A small **Radio** icon top-left pulses green while the connection is
  healthy. If it goes grey ("Realtime offline"), reload the page to
  reconnect.
- A yellow chip on the right counts photos that arrived **since you
  opened this page**. It''s a quick way to know whether anything new
  needs your attention without staring at the tabs.

## Recommended workflow on show night

1. Open the moderation queue on a phone or tablet from the merch table
   or front of house — anywhere with a stable connection.
2. Leave the **Pending** tab selected. New submissions appear at the
   bottom of the grid.
3. **Approve** anything safe to publish. The fan sees their photo on
   the public wall a few seconds later.
4. **Reject** with a short reason if the image is off-topic, blurry, or
   violates the venue''s policy. The reason is shown back to the poster
   so they know what went wrong.
5. If something slips through and a fan reports it later, you can
   **Remove** an already-approved photo from the **Approved** tab —
   that pulls it off the public wall and from Cloudinary.

## When realtime won''t work

- The fan-photos table must be in the `supabase_realtime` publication
  (migration 060). Self-hosted Supabase installations need the same
  migration applied.
- The Tour Manager OS deployment must have `NEXT_PUBLIC_SUPABASE_URL`
  and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exposed to the browser — these
  are standard Supabase env vars and are already set in prod.
- If a moderator''s network blocks WebSockets, the page falls back to
  a "refresh to see new photos" message and the queue still works,
  just not live.

## Try asking the help agent

- "How fast do new fan photos show up in the queue?"
- "Why is my realtime moderation queue not updating?"
- "Can two moderators work the queue at the same time?"
',
  'fan-engagement',
  array['moderation', 'fan-photos', 'realtime', 'admin']
)
on conflict (id) do update
set title = excluded.title,
    slug = excluded.slug,
    category = excluded.category,
    content = excluded.content,
    module_id = excluded.module_id,
    tags = excluded.tags,
    embedding = null,
    embedding_model = null,
    embedded_at = null;
