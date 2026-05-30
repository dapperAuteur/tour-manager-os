-- ============================================================
-- HELP ARTICLE REWRITE: Ticketing — user-facing language
-- The original article (migration 039) leaned heavily on SQL,
-- which most users can't run. Rewriting to cover the three real
-- audiences — fans (buying), door staff (scanning), tour managers
-- (asking the team to add a ticket type). Self-serve ticket-type
-- creation moves to a backlog item for a web form.
-- ============================================================

update help_articles
set
  title = 'Tickets — buying, scanning, and how new types are added',
  slug = 'tickets-overview',
  category = 'features',
  content = '# Tickets — buying, scanning, and how new types are added

Tour Manager OS sells tickets to live shows via secure Stripe checkout, delivers them as QR codes by email, and lets staff scan at the door from any phone. This article covers the three flows most people need: buying a ticket as a fan, scanning at the door as crew, and asking for a new ticket type as a tour manager.

## For fans — buying a ticket

1. Open the show''s ticket page. The artist or venue will share a link that looks like `tour.witus.online/shows/<id>/tickets` (replacing `<id>` with the actual show id).
2. Pick the ticket type you want (General Admission, VIP, Reserved). Each one shows the price and how many are left if inventory is limited.
3. Choose a quantity (1–10).
4. Enter your email — this is where the ticket(s) will be sent. You don''t need an account; guest checkout works.
5. Click **Continue to checkout**. Stripe handles the payment securely.
6. Within a few seconds of paying, you''ll get an email titled "Your ticket(s) — order …" with a link per ticket.

Open the link on your phone — that''s your ticket. Show the QR code at the door.

If you don''t see the email, check spam, then send feedback through the app and the team will help.

## For door staff — scanning at the door

1. Open the show in the dashboard: **Tours → pick a tour → pick the show → Door scanner**.
2. The page will ask for camera permission. Allow it.
3. Tap **Start camera**. Point the camera at a ticket''s QR code.
4. You''ll see one of these results:
   - **Green "Admitted"** — let them in. The ticket is now used.
   - **Orange "Already used"** — someone already scanned this ticket. Common when a group passes their phone around. Politely check that the right person is using it.
   - **Red "Forged code" / "Wrong show" / "Refunded" / "Void"** — don''t admit. The QR didn''t verify, was for a different show, or was refunded.
5. The tally at the bottom shows how many you''ve admitted, re-presented, and rejected so far.

If the camera doesn''t open or your device has no camera, tap **Manual entry** and type or paste the ticket id from the email link.

## For tour managers — adding a ticket type

Right now, creating a new ticket type (General Admission $25, VIP $150, Reserved Seating, etc.) isn''t a self-serve form — it''s a quick database setup. The team plans to ship a web form for this; until then, send a feedback message at `/feedback/new` with:

- The show date + city (so we know which show)
- The name of the type ("General Admission", "VIP Meet & Greet", etc.)
- The price
- How many to sell (or "unlimited")
- Whether it''s a paid ticket or a comp

A platform admin will create it within an hour during business hours and message you back when the buy page is live.

Once a ticket type exists, the public buy page automatically shows it — no further setup needed on your end.

## What the agent can help with

Ask the help agent any of these and it''ll walk you through:

- "How do I buy a ticket?"
- "What does the door scanner show when a ticket is already used?"
- "Can a single ticket be scanned twice by mistake?"
- "How do refunds work?"
- "How do I add a VIP ticket type?"

For anything not covered, send feedback — the team triages every message.
'
where id = '80000000-0000-0000-0000-000000000004';

-- Also clear the embedding so it gets re-embedded with the new content.
-- The admin backfill flow checks `embedding_model` mismatch, so we
-- also null embedding_model to force re-embed even if the configured
-- model hasn't changed.
update help_articles
set embedding = null,
    embedding_model = null,
    embedded_at = null
where id = '80000000-0000-0000-0000-000000000004';
