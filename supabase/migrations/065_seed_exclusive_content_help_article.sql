-- ============================================================
-- HELP ARTICLE: Pre/post-show exclusive content for subscribers
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000000a',
  'Releasing exclusive content to your email subscribers',
  'show-exclusive-content',
  'features',
  '# Releasing exclusive content to your email subscribers

Email subscribers showed up — give them something the rest of the
audience doesn''t get. Exclusive content is a small piece per show
(an acoustic preview, an after-party RSVP, a soundboard download)
that unlocks inside a time window relative to show day, gated by
the fan dropping the email address they signed up with.

## Where to find it

- **Admin**: `/tours/<tour-id>/shows/<show-id>/exclusive` — listed
  next to Crew call sheet and Rider compliance on the show page.
- **Public**: any fan visiting `/shows/<show-id>` sees a
  &ldquo;Subscribers only&rdquo; section once at least one active
  piece exists for that show.

## How to schedule a piece

1. Open the admin page and click **Add piece**.
2. Pick **Phase**:
   - **Pre-show** — meant to land before doors. Example: an acoustic
     preview of the encore. Stays unlocked until midnight on show day.
   - **Post-show** — drops after the show. Example: a "thank you"
     note with a private mix link. Stays unlocked forever.
3. Set **Unlock offset (hours)** — measured from midnight on the
   show date.
   - `-48` = unlocks 2 days before the show.
   - `0` = midnight show day.
   - `6` = 6 hours into show day (≈ post-headliner for an evening
     show).
4. Write the **Title** and **Body** (markdown OK). Optionally add a
   **Media URL** (SoundCloud, Dropbox, YouTube) and a **CTA**
   (button label + URL).
5. Save. The toggle in the list switches a piece between active and
   hidden without deleting it.

## What fans see

- Subscribers enter the email they signed up with on the public
  event page.
- `/api/shows/<id>/exclusive` looks for that email across every
  active subscriber list on your org. If it matches, the API
  returns every piece whose unlock window is currently open.
- If the email doesn''t match, the API politely says so. We never
  store the entered email; the check is one-shot.
- Non-subscribers don''t see the gate is even there until they
  visit a show with active pieces.

## What this is NOT

- Not a magic-link auth flow — it''s a soft email lookup. Anyone
  who knows a subscriber''s email can unlock the content. For
  hard auth, ticketing or community posts are the better route.
- Not paid content — Stripe Connect for paid drops is on the
  Phase 24 roadmap.
- Not a replacement for the merch store. Use exclusive content for
  the *intimate* extras — a soundcheck recording, a "here''s where
  we''re grabbing dinner" lobby tip, a post-show photo dump.

## Try asking the help agent

- "How do I send an acoustic preview to subscribers before a show?"
- "Where do I set when exclusive content unlocks?"
- "Why isn''t my pre-show content showing up yet?"
',
  'fan-engagement',
  array['fan-engagement', 'email', 'subscribers', 'exclusive', 'shows']
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
