-- ============================================================
-- HELP ARTICLE: Save a ticket to Google Wallet
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000001b',
  'Save a ticket to Google Wallet',
  'google-wallet-tickets',
  'features',
  '# Save a ticket to Google Wallet

Every paid ticket page has an **Add to Google Wallet** button.
Tap it once and the ticket lives in your phone wallet. It works
at the door even when the venue Wi-Fi is down.

## How to save the ticket

1. Open the ticket link from your purchase email. It looks like
   `/tickets/<id>?token=<long-string>`.
2. Tap **Add to Google Wallet** under the QR code.
3. Google shows a preview of the pass. Tap **Save**.

The pass shows the artist, venue, date, and the same QR code from
the ticket page. The QR is what door staff scan.

## What you can do with the pass

- See it from your phone lock screen near the show time.
- Show it at the door. The door scanner reads it the same way it
  reads the in-app QR.
- Use it offline. The QR is baked into the pass.

## What you cannot do

- The pass does not store payment info. It is only the ticket.
- You cannot share the pass. The QR is single-use. The first scan
  marks the ticket as used.
- Refunded or void tickets stop working on the next scan, even if
  the pass is still on your phone.

## When the button does not work

Sometimes the button shows a "Google Wallet not configured"
message. That means the band has not set up Google Wallet on
their side yet. Two things help:

1. The Apple Wallet button next to it may still work. Tap that
   instead if you have an iPhone.
2. The ticket link in your email always works in any browser. The
   QR on that page is the same one a saved pass shows.

The band can turn on Google Wallet in about ten minutes. The
steps are in the operator task `35-google-wallet-service-account.md`
in the repo. Anyone with access to the bands Google Cloud project
can do it. No engineer needed.

## Try asking the help agent

- How do I add my ticket to Google Wallet?
- Why does my pass say Google Wallet not configured?
- Does the Google Wallet pass work without internet?
',
  null,
  array['ticketing', 'google-wallet', 'show-day']
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
