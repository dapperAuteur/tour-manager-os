-- ============================================================
-- HELP ARTICLE: QuickBooks + Xero export
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000012',
  'Exporting expenses to QuickBooks Online or Xero',
  'quickbooks-xero-export',
  'features',
  '# Exporting expenses to QuickBooks Online or Xero

When your accountant asks for the tour&rsquo;s books at year-end,
hand them a CSV your accounting app already understands. The
**Export for accounting** dropdown on `/tours/<tour-id>/finances`
produces ready-to-import CSVs for **QuickBooks Online** and **Xero**.

## How to export

1. Open the tour&rsquo;s finances page.
2. Click **Export for accounting** at the top-right.
3. Pick **QuickBooks Online (CSV)** or **Xero (CSV)**.
4. The file downloads as `<tour-name>-quickbooks.csv` or
   `<tour-name>-xero.csv`.

## QuickBooks Online format

- Columns: `Date, Description, Amount, Category`.
- Dates: `MM/DD/YYYY` (QBO US default).
- Amounts: **negative** for every row &mdash; QBO treats negative
  bank-feed lines as money out.
- Description: the expense description plus the show label
  ("Venue Name &mdash; State &mdash; Date") so your accountant
  can see which leg the spend belongs to.
- Category: our 10 categories mapped to QBO chart-of-account names:
  - travel &rarr; Travel
  - hotel &rarr; Lodging
  - per_diem / meals &rarr; Meals & Entertainment
  - equipment &rarr; Tools & Equipment
  - crew &rarr; Contractors
  - merch &rarr; Cost of Goods Sold
  - marketing &rarr; Advertising & Marketing
  - insurance &rarr; Insurance
  - other &rarr; Other Business Expense

### Importing into QuickBooks Online

1. Go to **Transactions &rarr; Bank Transactions** in QBO.
2. Pick the bank you want to import to and click **Upload from file**.
3. Drop the CSV. QBO auto-detects the four columns.
4. Map and confirm.

## Xero format

- Columns: `*Date, *Amount, Payee, Description, Reference, Account Code`.
- Dates: `YYYY-MM-DD` (Xero accepts ISO across locales).
- Amount: **negative** for spent.
- Reference: the show label.
- Account Code: standard Xero chart of accounts:
  - travel / hotel / per_diem / meals &rarr; `420` (Motor Vehicle / Travel)
  - equipment &rarr; `710` (Office Equipment)
  - crew &rarr; `478` (Contractors)
  - merch &rarr; `500` (Cost of Goods Sold)
  - marketing &rarr; `400` (Advertising)
  - insurance &rarr; `433` (Insurance)
  - other &rarr; `404` (Bank Fees)

If your Xero org uses a different chart of accounts, the import
wizard lets you remap codes on the way in.

### Importing into Xero

1. Go to **Accounting &rarr; Bank Accounts &rarr; Manage Account &rarr; Import a Statement**.
2. Upload the CSV.
3. Confirm the column mapping.

## What this is *not*

- Not a live API integration. We don&rsquo;t push transactions
  into QuickBooks or Xero automatically &mdash; you stay in
  control of the import.
- Not the binary `.qbo` or `.qfx` formats. Modern QuickBooks
  Online prefers CSV imports for tour books, and most
  accountants we talked to do too.
- The export only covers `expenses` rows. Revenue + payouts +
  merch-sales export can come later once we hear what your
  accountant prefers.

## Try asking the help agent

- "How do I get the tour&rsquo;s expenses into QuickBooks?"
- "Which Xero account codes does Tour Manager OS use?"
- "Can I import multiple tours in one CSV?"
',
  'finances',
  array['finances', 'quickbooks', 'xero', 'export', 'accounting']
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
