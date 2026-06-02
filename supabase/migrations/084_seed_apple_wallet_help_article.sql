-- ============================================================
-- HELP ARTICLE: Adding tickets to Apple Wallet
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000018',
  'Adding your ticket to Apple Wallet',
  'apple-wallet-tickets',
  'features',
  '# Adding your ticket to Apple Wallet

Every paid ticket purchased through Tour Manager OS now has an
**Add to Apple Wallet** button on its ticket page. One tap drops
the pass into Wallet on your iPhone, where it surfaces on the lock
screen near show time, vibrates a reminder before doors, and works
offline at the door.

## How to add it

1. Open the ticket link from your purchase email (`/tickets/<id>?token=…`).
2. Tap **Add to Apple Wallet** under the QR code.
3. iOS opens the pass preview; tap **Add** in the top-right.

The pass shows: ticket type, artist, venue, date, doors time, a
short ticket-id reference, and the same QR your in-app ticket
has. Holder + venue address + a web fallback URL are on the back
of the pass.

## At the door

The pass&rsquo;s QR contains the same signed JSON our camera
scanner reads from the in-app ticket. Door staff can scan either
one &mdash; both verify against the platform&rsquo;s HMAC + the
same single-use guard.

If the venue&rsquo;s Wi-Fi drops, the pass keeps working &mdash; the
scanner&rsquo;s offline cache (see *Scanning tickets when the
venue Wi-Fi drops*) admits Wallet QRs identically to in-app QRs.

## Things to know

- We pull the show time from the advance sheet&rsquo;s `doors_time`
  (then `stage_time` as a fallback). iOS uses that to bubble the
  pass to the lock screen ahead of the show.
- Refunded or voided tickets return HTTP 410 on the pkpass route
  &mdash; the pass already saved on a phone still scans, but the
  scanner rejects it as `refunded` / `void` server-side.
- Google Wallet passes are **not** wired yet. Android users can
  still open the web ticket page and scan the QR there.

## What the platform admin must set up first

Apple Wallet passes have to be cryptographically signed by an
Apple-issued **Pass Type ID** certificate. If the platform
hasn&rsquo;t installed that cert + the Apple WWDR intermediate
cert into the deployment env, the Add to Wallet button returns a
503 with an "Apple Wallet not configured" message. See
`plans/user-tasks/33-apple-wallet-cert.md` for the exact env
vars the team needs to populate.

## Try asking the help agent

- "How do I save my ticket to my iPhone?"
- "Does the Wallet pass work without service at the door?"
- "Can I add my ticket to Google Pay too?"
',
  null,
  array['ticketing', 'apple-wallet', 'pkpass', 'show-day']
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
