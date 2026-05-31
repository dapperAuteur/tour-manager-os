-- ============================================================
-- HELP ARTICLE: Module walkthroughs (3-5 step first-access tutorials)
-- Lives in /help so the agent and search can surface it.
-- ============================================================

insert into help_articles (id, title, slug, category, content)
values (
  '80000000-0000-0000-0000-000000000005',
  'Module walkthroughs — first-access tutorials and how to replay them',
  'module-walkthroughs',
  'getting-started',
  '# Module walkthroughs

The first time you open a module like Today, Merch, Tour Finances, or a tour''s advance sheets page, a short 3-5 step walkthrough appears. Each step explains one thing — a button to click, a page to bookmark, a concept to understand — so you can be productive in a couple of minutes.

## What happens on first access

When you land on a covered page, an overlay slides up showing:
- The module name + which step of how many you''re on
- A short title for the step
- 2-4 sentences telling you exactly where to click and what to enter

Three buttons:
- **Next / Back** — move between steps. Arrow keys also work.
- **Skip walkthrough** — close it now; you can replay it any time.
- **Finish** — appears on the last step. Marks the walkthrough complete.

Press **Escape** at any point to skip.

## Replaying a walkthrough

Once you''ve finished or skipped, the auto-open stops — but a small **Walkthrough** button stays on the page (top-right, near the page title). Click it any time to play the steps again. Useful when:
- A team member is new and you want to show them the flow.
- You haven''t touched a module in months and forgot where things are.
- A new step was added since you last looked.

## Which modules have walkthroughs today

- **Show Day** — opens at /today
- **Tour Finances** — opens at /me/finances
- **Merch** — opens at /merch
- **Advance Sheets** — opens at /tours/<tour-id>

More modules will get walkthroughs over time. If a walkthrough''s steps look stale or you want one for a module that doesn''t have one, send feedback at /feedback/new.

## Try asking the help agent

- "What does the Today walkthrough cover?"
- "Can I replay a walkthrough later?"
- "How do I add a walkthrough for my team?"
'
)
on conflict (id) do update
set title = excluded.title,
    slug = excluded.slug,
    category = excluded.category,
    content = excluded.content,
    embedding = null,
    embedding_model = null,
    embedded_at = null;
