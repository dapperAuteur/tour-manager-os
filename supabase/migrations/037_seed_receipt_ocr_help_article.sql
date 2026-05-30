-- ============================================================
-- HELP ARTICLE: Using AI receipt scanning
-- Per the docs-update-after-task rule: new user-facing flow needs
-- an in-app instruction page.
-- ============================================================

insert into help_articles (
  id, title, slug, content, category, sort_order, published
) values (
  '80000000-0000-0000-0000-000000000003',
  'Using AI receipt scanning',
  'receipt-scanning',
  '# Using AI receipt scanning

The Add Expense form (under Tour → Finances → Add Expense) has a built-in receipt scanner. Snap a photo of any receipt and the AI fills in the amount, vendor, date, category, and a short description automatically. You review and edit before saving.

## How to use

1. Open your tour and click **Finances → Add Expense**.
2. At the top of the form, click **Upload receipt**.
3. Pick a JPEG / PNG / WebP / HEIC photo (10MB max).
4. Wait a few seconds. You''ll see "Uploading + reading the receipt…" then a thumbnail of your image plus a summary of what the AI extracted.
5. The form fields below auto-populate. Edit anything that looks wrong.
6. Click **Add Expense** to save.

The receipt image is attached to the expense and viewable later from the expense list.

## What the AI extracts

- **Amount** — the total paid (incl. tax + tip)
- **Date** — the transaction date
- **Vendor** — the merchant name
- **Category** — best fit from the 10 tour-finance buckets (travel, hotel, per_diem, meals, equipment, crew, merch, marketing, insurance, other)
- **Description** — a 1-line summary
- **Tax deductible** — checked automatically for business-looking expenses

It will leave any field **blank** when it can''t read or infer it confidently — better to leave it blank than guess wrong.

## What it does NOT do

- It does not see other expenses or your account data
- It does not auto-save — you always review and click Add Expense
- It does not process scans in batches (yet) — one receipt at a time

## Models and cost

By default, scans use **Claude 3.5 Sonnet** via OpenRouter (highest quality for receipts) at roughly $3/M input + $15/M output tokens. A typical scan is ~1500 input tokens + ~200 output tokens = under one US cent per receipt.

Super-admins can swap the vision model at `/admin/ai` (look for **vision_model**). Cheaper options: `together/meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo` for similar quality at $1.20/M, or `openrouter/openai/gpt-4o-mini` if available with vision support.

## If extraction fails

- If the AI returns no usable fields, the form stays blank — fill in manually. The receipt is still attached.
- Common reasons for failure: very low-resolution image, handwritten receipt, foreign-language receipt with non-Latin script, blurry photo.
- Re-take the photo with better lighting and try again. Tap **Remove and start over** to clear the failed attempt.

## Privacy

Receipt images upload to Cloudinary under your user folder (`tour-manager-os/receipts/<user-id>/`). Only you + tour managers on the same tour can see expenses you create (per Tour Finances RLS). Receipts are NOT used to train any model — Vercel AI Gateway and LangSmith both have zero-data-retention defaults on the routed providers.

## Where the code lives

- `lib/ai/vision.ts` — extractor + Zod schema
- `app/api/expenses/extract-receipt/route.ts` — upload + extract endpoint
- `app/(auth)/tours/[id]/finances/expenses/new/add-expense-form.tsx` — the scanner panel

See the Academy lesson "Codebase Tour" for the full directory map.',
  'features',
  102,
  true
)
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = now();
