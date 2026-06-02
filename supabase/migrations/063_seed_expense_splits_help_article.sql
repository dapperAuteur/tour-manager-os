-- ============================================================
-- HELP ARTICLE: Splitting an expense across the team
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000009',
  'Splitting an expense across the team',
  'expense-splitting',
  'features',
  '# Splitting an expense across the team

When one of you fronts a hotel bill, dinner check, or piece of gear,
the tour P&L only sees the total. Splitting lets you slice that single
expense into per-member shares — and gives everyone a one-tap way to
settle when the money actually moves.

## Where to find it

1. Open `/tours/<tour-id>/finances`.
2. On any row in the expense table, click **Split**.
3. You land on the expense detail page with the splitter ready.

## How it works

- **Even split** (default): the splitter pre-fills equal shares for
  every org member. If the math doesn''t divide evenly the last
  cent or two lands on the first share — you can adjust by hand.
- **Custom shares**: change any per-member amount, add or remove
  members. The total at the bottom turns green when it matches the
  expense, red when it doesn''t. Save is disabled until they match.
- **Settle tracking**: each share starts as **owed**. Mark it
  settled via Cash, Venmo, Zelle, PayPal, Cash App, Bank, or Other.
  Settled shares show a green check; you can reopen one if a
  Venmo bounces.

## Where I see what I owe

- Your `/me/finances` page now shows an **Expense splits** section
  with two columns:
  - **You owe** — shares created by other members that you still
    need to settle. Pick a method to mark paid.
  - **People owe you** — shares you created for expenses you
    fronted. Mark received when the cash arrives.
- A small chip at the top shows the running net: positive when
  people owe you more than you owe, negative when it''s the other
  way around.

## Vs. the loan ledger

The **Member loans** section (drummer borrowed $5 from guitarist for
a coffee) is for one-off person-to-person amounts that aren''t tied
to a tracked expense. Splits are for a *real* expense already in the
finances list — a hotel, a meal, a flight — that needs slicing.

## Try asking the help agent

- "How do I split a hotel bill four ways?"
- "Where do I see what I owe the drummer?"
- "Can I mark a share paid via Venmo?"
',
  'finances',
  array['finances', 'expenses', 'splits', 'settlements']
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
