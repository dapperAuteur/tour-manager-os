-- ============================================================
-- HELP ARTICLE: Web push notifications
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000010',
  'Turning on push notifications for schedule changes',
  'push-notifications',
  'features',
  '# Turning on push notifications for schedule changes

Show times shift. Advance sheets land at 11pm. Family-hub polls
close while you&rsquo;re sound-checking. Push notifications wake
you up for the ones that matter.

## How to enable

1. Open `/settings`.
2. Scroll to the **Push notifications** section.
3. Click **Turn on push**. Your browser asks for permission &mdash;
   click **Allow**.
4. Click **Send test** to confirm your device receives the
   notification. You should see a banner from Tour Manager OS
   within a couple of seconds.

Each browser / device is registered separately. Add notifications
on your phone, your laptop, and your tablet by enabling on each
one. We track them as distinct subscriptions and fan out to all of
them when something happens.

## What triggers a push today

- **Advance sheet submitted** &mdash; when a venue submits an
  advance sheet for a show on one of your tours, every member of
  the org gets a push. The notification deep-links to the show
  detail page.
- **Schedule change** *(rolling out)* &mdash; doors / stage /
  curfew updates on a show you&rsquo;re on the call sheet for.
- **Poll closing** *(rolling out)* &mdash; family-hub polls that
  are about to expire.

You opt in to topics when you turn push on for the first time
(default = all three). To narrow this in the future, we&rsquo;ll
add per-topic toggles inside the section.

## How to turn it off

- **Just this device**: click **Turn off** in the push section.
  The subscription is removed from the server and the service
  worker stops listening.
- **Globally** (you don&rsquo;t want any device to receive push):
  turn off on each device individually. There&rsquo;s no master
  switch yet because we honour per-device opt-in.

## When push won&rsquo;t work

- iOS Safari requires the app to be installed via **Add to Home
  Screen** before push will fire. Until then the toggle still
  saves your subscription but iOS swallows the notification.
- Private / incognito windows can&rsquo;t register a service
  worker, so the toggle stays disabled there.
- If you previously **denied** notifications at the browser
  prompt, the section shows a warning and the **Turn on push**
  button won&rsquo;t work until you re-allow notifications in
  your browser settings (click the padlock in the address bar).

## What the server needs

The server needs **VAPID keys** (a public / private pair) in the
environment:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` &mdash; exposed to the browser.
- `VAPID_PRIVATE_KEY` &mdash; server-only.
- `VAPID_SUBJECT` &mdash; either a `mailto:` or `https://` URL the
  push services can reach for problem reports.

If those are unset, the toggle still renders but **Turn on push**
will warn that push isn&rsquo;t configured.

## Try asking the help agent

- "Why isn&rsquo;t my push notification arriving?"
- "Can I get pushed when the doors time changes?"
- "How do I turn off push on my phone only?"
',
  null,
  array['push', 'notifications', 'vapid', 'service-worker', 'show-day']
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
