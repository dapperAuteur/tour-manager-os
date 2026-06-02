-- ============================================================
-- HELP ARTICLE: Tour settlement PDF
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000001c',
  'Get a one-page settlement PDF for your tour',
  'tour-settlement-pdf',
  'features',
  '# Get a one-page settlement PDF for your tour

A settlement is the paper you hand a manager, accountant, or band
member when the tour ends. It shows what the tour earned, what it
spent, and who gets paid what.

Tour Manager OS builds this for you. You do not need to type
anything into Excel. The numbers come from the data you already
have on the tour.

## How to get it

1. Open the tour you want a settlement for.
2. Click **Finances** in the top nav for that tour.
3. Click **Settlement PDF** in the row of buttons at the top.
4. Your browser will download a one-page PDF named after the tour.

That is it. The file is ready to print, attach to an email, or
drop into a folder for your accountant.

## What is on it

The PDF lists, in order:

- The tour name, the artist, the dates, the show count, and the
  number of tickets sold.
- Revenue: ticket sales, merch sales, and guarantees from the
  venues. Then a total.
- Expenses: a row for each category you tracked (travel, hotel,
  per diem, meals, equipment, crew, merch, marketing, insurance,
  and any other). Then a total.
- Net: revenue minus expenses. Green if you came out ahead. Red
  if the tour lost money.
- Revenue splits: if you set up percentage splits on the tour, the
  PDF shows who gets what at those percentages.
- Stripe transfers: if you routed real money to band members
  through Stripe Connect, the PDF shows what each transfer was
  for and its status.
- A footer with the date the file was made.

## Why this is useful

- Tax time. The accountant gets one page instead of a CSV they
  have to read.
- Splits. Everyone on the tour can see the same number and how it
  was figured.
- Sponsors and partners. You can send a clean page that proves
  the tour numbers without sharing the whole finance tool.

## Who can download it

Anyone who is a member of the tour can. The button is right on
the tour finances page. There is no extra setup. There are no
extra permissions to wire up.

## What if the numbers look wrong

The PDF is a snapshot of what is in the tour right now. If a
number looks wrong, fix it on the page it came from. Then click
**Settlement PDF** again. The new file will have the new number.

Common spots to check:

- Ticket sales feel low? Open **Tickets** on the show. Refunds
  do not count toward the total.
- Merch sales feel low? Open **Merch** on the tour. The PDF
  sums all sale rows for the tour.
- Guarantees feel off? Open the show and check the **Revenue**
  tab.
- Expenses missing? Open **Finances**, **Add Expense**, and add
  the missing row.

## What if I get stuck

Ask the help agent on `/help`. It knows this article.

Or open `/feedback` and tell us. If a number is wrong on every
tour, that is a bug and we will fix it.',
  null,
  array['finances', 'settlement', 'pdf', 'accounting']
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  module_id = excluded.module_id,
  tags = excluded.tags,
  updated_at = now();
