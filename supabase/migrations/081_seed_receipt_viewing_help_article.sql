-- ============================================================
-- HELP ARTICLE: Viewing receipts attached to expenses
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000016',
  'Viewing the receipt attached to a tour expense',
  'expense-receipt-viewing',
  'features',
  '# Viewing the receipt attached to a tour expense

When you (or the AI vision scanner) attach a receipt to an
expense, the image stays linked to that row forever. The expense
detail page is where you see the full receipt and the table
flags which rows are documented vs. not.

## Where to look

- **Tour finances list** (`/tours/<id>/finances`): every row that
  has a receipt attached now shows a small Receipt icon next to
  the description column. No icon = no receipt on file.
- **Expense detail** (click **Split** on a row to open
  `/tours/<id>/finances/expenses/<expenseId>`): when the row has a
  receipt, a **Receipt** section appears above the splitter with a
  thumbnail. Click the thumbnail to open the full-resolution
  lightbox.

## Image vs. PDF

- **Image receipts** (.jpg / .png / .webp / .heic): rendered
  inline via Cloudinary&rsquo;s `f_auto,q_auto` transforms. The
  thumbnail uses `w_400,c_limit`, the lightbox uses `w_1600,c_limit`,
  so the page stays light even when the original is a 12 MP phone
  photo.
- **PDF receipts**: rendered as an **Open PDF receipt** button
  that opens the file in a new tab. We don&rsquo;t embed PDFs
  inline yet &mdash; browsers vary too much on inline-PDF support
  and the new-tab open is universal.

## How a receipt gets attached

There are two paths today:

1. **AI receipt scanning** during expense creation. On
   `/tours/<id>/finances/expenses/new` you can drop a phone photo
   of the receipt; the vision model extracts amount / vendor /
   date / category and pre-fills the form, and the image url is
   saved alongside.
2. **Manual** &mdash; paste a receipt url into the **Receipt
   URL** field on the expense form. Any reachable image or PDF
   works; Cloudinary URLs get the auto-transform treatment for
   free.

## What it isn&rsquo;t (yet)

- We don&rsquo;t store receipts ourselves &mdash; we point at
  Cloudinary URLs that the receipt-scanning upload set. If the
  Cloudinary asset is deleted, the link breaks.
- No PDF preview rendering. Open in a new tab.
- No bulk reconcile view yet (audit drift &rarr; closes the basic
  &ldquo;is this expense documented?&rdquo; question; bulk
  workflows belong in a follow-up).

## Try asking the help agent

- "How do I see the receipt for an expense?"
- "Can I attach a PDF receipt instead of a photo?"
- "Why does my expense row have no receipt icon?"
',
  'finances',
  array['finances', 'receipts', 'expenses']
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
