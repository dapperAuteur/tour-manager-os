-- ============================================================
-- HELP ARTICLE: Academy completion certificates (PDF)
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000000b',
  'Downloading your Academy completion certificate',
  'academy-certificates',
  'features',
  '# Downloading your Academy completion certificate

Finish every lesson in an Academy course and a printable PDF
certificate becomes available with your name, the course title, the
completion date, and a verification ID. Frame it, share it with a
booking agent, or attach it when you pitch yourself as the tour
manager who actually trained on the platform.

## How to earn one

1. Open `/academy` and pick a course.
2. Work through every lesson — when you mark the final one done,
   the course flips to **completed** and the certificate unlocks.
3. The course page now shows a green &ldquo;Course complete&rdquo;
   banner with a **Download certificate (PDF)** button.

The button hits `/api/academy/courses/<slug>/certificate`. If you
haven&rsquo;t completed the course yet, the API politely refuses
(403); if you have, it returns a one-page landscape PDF.

## What the PDF looks like

- A4 landscape, double-border layout.
- &ldquo;Tour Manager OS Academy&rdquo; header.
- &ldquo;Certificate of Completion&rdquo; title.
- Your display name (from your profile — set it on `/settings`
  before downloading if you want a specific spelling).
- Course title in primary brand colour.
- Completion date in long form.
- Verification ID + `tour.witus.online/academy` URL in the footer.

## Sharing + verifying

- The PDF is generated fresh each download from your
  `user_course_progress` row — re-issued anywhere your name or the
  completion date needs to refresh.
- The verification ID maps to your private progress row. We don&rsquo;t
  publish a public verifier yet; if someone questions a certificate,
  forward the verification ID and we&rsquo;ll confirm it in the
  admin tools.

## Try asking the help agent

- "Where do I get my Academy certificate?"
- "Can I rename the certificate to use my full legal name?"
- "Does the certificate expire?"
',
  'academy',
  array['academy', 'certificate', 'pdf', 'lms']
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
