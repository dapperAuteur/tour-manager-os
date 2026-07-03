-- ============================================================
-- HELP ARTICLE: Live stream a show
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000001e',
  'Live stream a show to your fans',
  'live-stream-show',
  'features',
  '# Live stream a show to your fans

You can put a live video on a show''s public page. Fans who cannot
be there watch from home. You can also use it for a behind-the-
scenes look before doors.

The video comes from your Viloud account. Tour Manager OS just
shows it on the page when you turn the show live.

## How to go live

1. Start your stream in Viloud like you normally would.
2. In Tour Manager OS, open the show from your tour.
3. Click **Go live**.
4. Open the show''s public page to check it. You will see a
   **Live now** badge and the video.

## How to stop

1. Open the same show.
2. Click **Stop**.

The video comes off the public page right away. Your Viloud
stream is not changed. Stop it in Viloud when you are done.

## Who can turn it on

Anyone on the tour can go live or stop. It is meant for the tour
manager or whoever runs the stream that night.

## Good to know

- The button only shows the stream when the platform Viloud
  settings are in place. If you see &ldquo;not set up,&rdquo; ask the
  platform team to add the streaming settings.
- Turning a show live does not start or stop Viloud for you. You
  run the stream in Viloud. The button only controls whether fans
  see it on the show page.
- The video sits near the top of the show page so fans find it
  fast.

## What if I get stuck

- **Button says not set up.** The server needs the Viloud
  settings. This is a one-time platform task.
- **I clicked Go live but see nothing.** Make sure your Viloud
  stream is actually running, then refresh the show page.
- Ask the help agent on `/help`. It knows this article.',
  null,
  array['streaming', 'live', 'video', 'shows', 'fans', 'viloud']
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  module_id = excluded.module_id,
  tags = excluded.tags,
  updated_at = now();
