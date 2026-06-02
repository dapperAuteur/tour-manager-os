-- ============================================================
-- HELP ARTICLE: AI moderation pre-filter for fan photos
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000000c',
  'How AI pre-filters fan photos before the moderation queue',
  'fan-photo-ai-moderation',
  'features',
  '# How AI pre-filters fan photos before the moderation queue

When a fan uploads a photo to a show, it now runs through a vision
model the moment Cloudinary stores it — before a human moderator
sees it. The pre-filter does two things: short-circuits the obvious
rejects so no one has to look at them, and decorates everything
else with a quick verdict so the queue can be triaged faster.

## What the model is checking

Three flags + an overall confidence:

- **NSFW** — explicit nudity, sexual content, graphic genital
  exposure. Triggers auto-reject at high confidence.
- **Violence** — graphic injury, blood, weapons used aggressively,
  imminent violence. Triggers auto-reject at high confidence.
- **Off-topic** — clearly not a live music event (no stage, no
  audience, no instruments, no venue, no backstage context). Never
  auto-rejects — that judgment stays with the band.

The model also writes a short neutral one-sentence reason describing
what it saw. If the photo auto-rejects, that reason is shown back to
the poster in the rejection notice.

## What auto-rejection means

- The fan_photos row flips straight to `status = ''rejected''` with
  `ai_auto_rejected = true`.
- The Cloudinary asset is kept so a moderator can override (the
  human Reopen action restores the row to `pending` and the
  verdict stays attached).
- No human moderator ever has to view the worst stuff.

## What human moderators see

- Every photo in the queue with a verdict has a yellow card under
  the caption labelled **AI verdict** plus chips for which flags
  fired (NSFW / Violence / Off-topic) and the model''s confidence
  level.
- Auto-rejected photos are filed under the **Rejected** tab with
  an `auto-rejected` note on the verdict card so you can audit
  the model''s call.
- Nothing about the existing approve / reject / remove flow
  changes; this just makes the queue triage faster.

## Limits + privacy

- The model only sees the image URL and a system prompt. It does
  not see the caption, the user, the show, or any other context.
- This is a soft pre-filter, not a substitute for human review.
  Mistakes go both ways; appeals through the existing reject
  email/feedback flow still work.
- The verdict is stored on the fan_photos row as a JSONB blob in
  `ai_moderation_verdict` — handy if we later want to surface
  trends in the admin dashboard.

## Try asking the help agent

- "Does AI auto-reject NSFW fan photos?"
- "How do I see what the AI flagged?"
- "Can I turn off the AI moderation pre-filter?"
',
  'fan-engagement',
  array['moderation', 'fan-photos', 'ai', 'vision-model']
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
