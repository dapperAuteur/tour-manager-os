-- ============================================================
-- HELP ARTICLE: Video lessons in the Academy
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000000e',
  'Adding a video to an Academy lesson',
  'academy-video-lessons',
  'features',
  '# Adding a video to an Academy lesson

A lesson can pair its markdown body with a video player above the
text. You paste a normal share URL into the **Video URL** field on
the lesson editor — no API keys, no manual embed code.

## Supported video sources

The lesson page understands these URL shapes out of the box:

- **YouTube** — `youtube.com/watch?v=…`, `youtu.be/<id>`,
  `youtube.com/shorts/<id>`, `youtube.com/embed/<id>`. Renders
  through `youtube-nocookie.com` for privacy.
- **Vimeo** — `vimeo.com/<id>`.
- **Loom** — `loom.com/share/<id>`.
- **Direct video files** — any `.mp4`, `.webm`, `.mov`, or `.ogv`
  URL. Played in a native HTML5 video element with controls.

If you paste a URL we don&rsquo;t recognise, the page falls back to
a &ldquo;Watch lesson video&rdquo; external link so the learner can
still reach the content.

## Authoring a video lesson

1. Open `/admin/academy` and pick the course (or create one).
2. **Add lesson** or pencil-edit an existing lesson.
3. Paste the share URL into **Video URL**.
4. Keep the markdown body — the video sits *above* the text, and
   most learners scrub the video while reading. Use the body for
   the recap, the diagram, and the &ldquo;try it yourself&rdquo;
   steps.
5. Save.

## What learners see

- The course outline at `/academy/<course-slug>` shows a small
  **Video** chip next to lessons that have a URL set, so they
  know what to expect.
- The lesson page renders a responsive 16:9 video player above the
  body. iframe embeds (YouTube / Vimeo / Loom) load lazily and
  obey the platform&rsquo;s consent and tracking rules. Direct
  videos play inline with controls; no autoplay.

## Privacy + accessibility notes

- We use the `youtube-nocookie.com` host for YouTube embeds so
  YouTube only sets cookies after the learner hits play.
- The container preserves a 16:9 aspect ratio at every viewport
  width so the video never breaks the page layout.
- For direct video URLs, please host transcripts or captions on
  your video host — we don&rsquo;t inject a track element
  automatically yet.

## Try asking the help agent

- "Can I embed a Vimeo video in an Academy lesson?"
- "Does the video play before or after the lesson text?"
- "How do I host the video file myself?"
',
  'academy',
  array['academy', 'video', 'lesson', 'embed']
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
