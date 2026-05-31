-- ============================================================
-- HELP ARTICLE: CSV import wizard
-- ============================================================

insert into help_articles (id, title, slug, category, content)
values (
  '80000000-0000-0000-0000-000000000006',
  'Importing data from CSV',
  'csv-import',
  'features',
  '# Importing data from CSV

If you''re moving in from a spreadsheet, the CSV import wizard at `/data/import` brings your data over without copy-pasting one row at a time.

## What can I import today

- **Shows** — bulk-add show dates to a tour (date, city, state, venue, timezone).
- **Expenses** — add expense lines to a tour''s finances (date, category, amount, description, tax-deductible flag).
- **Venue Contacts** — add booker/production/hospitality/sound/etc. contacts to a single venue at a time.

More targets are coming. If you need one we don''t support yet, send feedback at /feedback/new.

## How the wizard works

1. **Open** `/data/import` from the dashboard. Click the target you want.
2. **Pick context** (if asked). Shows and expenses go on a tour, so the wizard asks which one. Venue contacts go on a venue.
3. **Upload your CSV.** The first row should be your column headers. Download a template from `/data` if you''re not sure of the format.
4. **Map columns.** Tell the wizard which column in your file matches each field. We auto-match anything that looks obvious (e.g. a column called "Date" maps to Date). Pick "Skip" for any column you don''t want imported.
5. **Preview.** The first 5 rows are shown with the mapping applied. If they look right, click Run import.
6. **See the result.** You''ll see how many rows imported, how many were skipped, and a row-by-row error list. Fix issues in your CSV and re-upload — it''s safe to run the wizard again.

## Common errors

- **"Date must be YYYY-MM-DD"** — Excel often saves dates as `7/15/2026` or similar. Format the column as `YYYY-MM-DD` before exporting.
- **"Amount … is not a positive number"** — Currency symbols or commas in the amount column trip the validator. Use plain numbers like `189.00`.
- **"Category … is not one of …"** — The wizard lists the accepted values (travel, hotel, per_diem, etc.). Replace your column''s value with one from the list.
- **"Phone or email is required"** — Venue contacts need a way to reach them. Leave one blank; not both.

## Try asking the help agent

- "How do I import shows from a spreadsheet?"
- "What date format should I use in CSV?"
- "Can I import contacts for multiple venues at once?"
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
