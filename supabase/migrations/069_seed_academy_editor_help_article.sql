-- ============================================================
-- HELP ARTICLE: Admin course/lesson editor
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000000d',
  'Editing Academy courses and lessons (admin)',
  'admin-academy-editor',
  'features',
  '# Editing Academy courses and lessons (admin)

Super admins can author and edit Academy courses directly in the UI
instead of writing migrations or seed scripts. The editor lives at
`/admin/academy`.

## What you can edit

- **Courses**: title, slug, description, category, difficulty
  (beginner / intermediate / advanced), estimated minutes, sort
  order, and the published flag.
- **Lessons** (inside a course): title, slug, markdown body, video
  URL, sort order, and the published flag.

Quizzes are still authored via SQL migration for now. Track this on
the Phase 13 roadmap.

## Common workflows

### Create a new course

1. Open `/admin/academy` → **New course**.
2. Fill in title; leave **Slug** blank to auto-slugify (matches the
   `/academy/<slug>` URL).
3. Pick a **Category** (free-form text, but conventionally
   `show-day`, `finances`, `merch`, `wellness`, `admin-education`,
   etc.).
4. Set **Difficulty** and **Estimated minutes** so the course
   catalog can sort and filter.
5. Leave **Published** ticked to expose the course on `/academy`
   immediately, or untick to keep it as a draft only visible in the
   admin list.
6. Save → you land on the lesson editor for the new course.

### Add lessons

- On the course edit page, click **Add lesson**. Fill in title,
  body (markdown), and optional video URL. Sort order controls the
  order learners see — lower = earlier.
- Leave **Published** ticked to expose the lesson on the course
  page. Drafts stay hidden until you flip the toggle.
- Use the pencil icon to edit an existing lesson inline, the trash
  icon to delete it.

### Unpublish a course or lesson

Untick the **Published** flag and save. The row stays in the DB
but disappears from `/academy`. Re-tick to bring it back.

### Delete a course

Open the course edit page → **Delete course**. This cascades to
every lesson and quiz inside it. There is no undo, so unpublish
first if you want a soft hide.

## Who can do this

Editing is gated to super admins (matched by email in
`lib/auth/super-admin.ts`). Regular tour managers and members
can&rsquo;t see `/admin/academy` and the API actions refuse them.

## Try asking the help agent

- "How do I add a new Academy course?"
- "Can I unpublish a lesson without deleting it?"
- "Where do I author quizzes?"
',
  'academy',
  array['academy', 'admin', 'editor', 'lessons', 'courses']
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
