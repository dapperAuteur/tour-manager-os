-- ============================================================
-- HELP ARTICLE REWRITE: ticketing now reflects the self-serve UI
-- 2026-05-30 (third revision). Previous text told tour managers to
-- "send feedback and the team will set up your ticket type". That
-- was wrong product-vision-wise: this app is self-serve, admin is
-- platform team only (see plans + memory). Now that the create /
-- edit / delete UI exists, the article documents the real flow.
-- ============================================================

update help_articles
set
  title = 'Tickets — selling, scanning, and managing types',
  slug = 'tickets-overview',
  category = 'features',
  content = '# Tickets — selling, scanning, and managing types

Tour Manager OS sells tickets via secure Stripe checkout, delivers them as QR codes by email, and lets you scan them at the door from any phone. This article covers all three flows: fans buying, door staff scanning, and you (the tour manager) creating ticket types.

## For tour managers — create and manage ticket types

1. Open the show: **Tours → pick your tour → pick the show → Ticketing**.
2. Click **New ticket type** in the top-right.
3. Fill in:
   - **Name** — what fans see on the buy page (e.g. "General Admission", "VIP Meet & Greet", "Front Row")
   - **Category** — General Admission, VIP, Reserved Seating, or Complimentary (free)
   - **Price** — USD. Comp tickets are always $0; other tiers need to be $0.50 or more
   - **Inventory** — check "Unlimited" or set a cap. When the cap is hit, the option goes "sold out" automatically
   - **Description** (optional) — what the tier includes (early entry, signed poster, etc.)
   - **Visible on the public buy page** — uncheck to keep a draft / hide a sold-out tier
4. Click **Create ticket type**. The public buy page at `tour.witus.online/shows/<id>/tickets` immediately picks it up.

To change a tier later, click **Edit** in the row. You can change anything safely — the form warns when sales have already happened so you don''t accidentally raise the price on existing buyers.

To take a tier off sale, click **Edit** and uncheck "Visible on the public buy page". Already-sold tickets keep working; only new sales stop.

To delete a tier with no sales, click **Delete**. Tiers with sold tickets can''t be deleted (it would orphan their QR codes) — hide them instead.

## For fans — buying a ticket

1. Open the show''s ticket page. The artist or venue will share a link that looks like `tour.witus.online/shows/<id>/tickets`.
2. Pick the ticket type you want. Each shows the price and how many are left if inventory is limited.
3. Choose a quantity (1–10).
4. Enter your email — that''s where the ticket goes. No account required.
5. Click **Continue to checkout**. Stripe handles payment securely.
6. Within a few seconds you''ll get an email titled "Your ticket(s) — order …" with a link per ticket.

Open the link on your phone — that''s your ticket. Show the QR code at the door.

If you don''t see the email, check spam. Still missing? Send feedback through the app — every reply goes to your inbox.

## For door staff — scanning at the door

1. Open the show in the dashboard: **Tours → pick the tour → pick the show → Door scanner**.
2. The page asks for camera permission. Allow it.
3. Tap **Start camera**. Point the camera at a ticket''s QR code.
4. Result options:
   - **Green "Admitted"** — let them in. The ticket is now used.
   - **Orange "Already used"** — someone already scanned this ticket. Common when a group passes phones around. Politely check the right person is using it.
   - **Red "Forged code" / "Wrong show" / "Refunded" / "Void"** — don''t admit. The QR didn''t verify, was for a different show, or was refunded.
5. The tally at the bottom shows admitted / re-presented / rejected counts.

If the camera doesn''t open or your device has no camera, tap **Manual entry** and paste the ticket id from the email link.

## What the agent can help with

Ask the help agent any of these:

- "How do I create a VIP ticket type for my next show?"
- "How do I hide a sold-out ticket tier without losing sales data?"
- "What happens when someone tries to use a refunded ticket?"
- "Can a fan buy multiple tickets at once?"
- "How do refunds work?"
- "Do I need an account to buy a ticket?"

For anything not covered, send feedback via `/feedback/new` — the team triages every message.
'
where id = '80000000-0000-0000-0000-000000000004';

-- Clear embedding so the live agent re-embeds with the new copy.
update help_articles
set embedding = null,
    embedding_model = null,
    embedded_at = null
where id = '80000000-0000-0000-0000-000000000004';
