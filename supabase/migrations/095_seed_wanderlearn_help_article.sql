-- ============================================================
-- HELP ARTICLE: Add a WanderLearn virtual tour to a show
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000001f',
  'Add a virtual tour to a show',
  'wanderlearn-virtual-tour',
  'features',
  '# Add a virtual tour to a show

You can put a 360 virtual tour on a show''s public page. Fans move
around the room right from their phone or computer. It is great
for a behind-the-scenes look or for fans who cannot be there.

The tour comes from WanderLearn (wanderlearn.witus.online). You
make the tour there, then paste its embed code here.

## How to add it

1. In WanderLearn, open the tour you want and copy its **embed
   code**. It looks like `<iframe src="https://wanderlearn.witus.online/embed/tours/...">`.
2. In Tour Manager OS, open the show from your tour.
3. Find the **Virtual tour (WanderLearn)** box.
4. Paste the embed code. You can paste the whole `<iframe>` or
   just the link. Both work.
5. Click **Save**.

Open the show''s public page to check it. The tour shows near the
top under a **Virtual tour** heading.

## How to change or remove it

- Open the show, find the box, click **Change** to paste a new
  one.
- Click **Remove** to take it off the public page.

## Why only WanderLearn links work

For safety, we only accept links from `wanderlearn.witus.online`.
If you paste a link from anywhere else, you will see a message
that says the link must be a WanderLearn tour. This keeps bad or
unsafe pages off your show page.

## Who can add it

Anyone on the tour can add, change, or remove the virtual tour.

## What if I get stuck

- **&ldquo;The link must be a wanderlearn.witus.online tour.&rdquo;**
  You pasted a link from another site. Copy the embed code from
  WanderLearn instead.
- **&ldquo;That does not look like a valid link.&rdquo;** The text you
  pasted has no web address in it. Copy the full embed code again.
- **Nothing shows on the public page.** Make sure you clicked
  Save, then refresh the public page.
- Ask the help agent on `/help`. It knows this article.',
  null,
  array['wanderlearn', 'virtual tour', '360', 'shows', 'fans', 'embed']
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  module_id = excluded.module_id,
  tags = excluded.tags,
  updated_at = now();
