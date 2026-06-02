-- ============================================================
-- HELP ARTICLE: Connecting your Gmail to send campaigns
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000019',
  'Connecting your Gmail so campaigns send from your own address',
  'gmail-send-as',
  'features',
  '# Connecting your Gmail so campaigns send from your own address

By default, Tour Manager OS sends email campaigns through a
platform-shared address (`noreply@mg.witus.online`) via Mailgun.
That works, but fans see a generic sender and replies bounce into
the void. Connect your own Gmail account once, and from then on:

- Outbound campaigns go through **the Gmail API as you**.
- The message lands in your **Sent folder** automatically.
- Replies route to **your inbox** &mdash; you can answer right
  from Gmail like any other email.
- Fans see your name and address, not a platform alias.

## How to connect (one-time, &lt; 60 seconds)

1. Open `/settings`.
2. Scroll to **Email sender (Gmail)**.
3. Click **Connect Gmail**. Google opens its consent screen.
4. Pick the Gmail account you want to send from.
5. Google shows what we&rsquo;re asking for &mdash; only
   `gmail.send` (send mail as you) and `userinfo.email` (so we
   know which address is connected). Click **Continue**.
6. Google redirects you back to `/settings?gmail_oauth=connected`.
   The section now shows &ldquo;Connected as &lt;your-email&gt;&rdquo;.

Send a test campaign from `/marketing/campaigns/new` to verify
the message arrives from your address.

## How to disconnect

- **Just on Tour Manager OS**: open `/settings` &rarr; **Disconnect**.
  Campaigns immediately fall back to the platform Mailgun address.
- **Also revoke the grant on Google**: visit
  https://myaccount.google.com/permissions, find "Tour Manager OS",
  and click **Remove access**. This is optional &mdash; disconnecting
  on our side already forgets your tokens.

## What we store

| Field | Purpose |
| --- | --- |
| `access_token` | Short-lived (1h) credential used to call the Gmail send API |
| `refresh_token` | Long-lived credential used to mint a new access token when the current one expires |
| `email_address` | The Gmail address Google reports for your account |
| `scopes` | Just `gmail.send` + `userinfo.email` &mdash; we cannot read your mail |
| `expires_at` | When the current access token expires |

Tokens live on the `oauth_email_connections` table with RLS that
only lets **you** see your row. The server uses an admin client
to read tokens at send time.

## Troubleshooting

- **"Gmail OAuth isn&rsquo;t configured on this server."** &mdash;
  The platform admin hasn&rsquo;t provisioned the Google OAuth
  client yet. Hand them
  `plans/user-tasks/35-google-oauth-client.md` (or follow it
  yourself if you have access to the Google Cloud Console for the
  Tour Manager OS project &mdash; the steps are standard and take
  about 10 minutes).
- **&ldquo;Google did not return a refresh token.&rdquo;** Visit
  https://myaccount.google.com/permissions, remove the Tour Manager
  OS authorization, then click **Connect Gmail** again. Google
  only ships a refresh token on the **first** consent.
- **OAuth state mismatch.** Refresh the `/settings` page and click
  Connect Gmail directly from there &mdash; don&rsquo;t bookmark
  the `/api/oauth/gmail/init` URL or it&rsquo;ll fail the CSRF check.

## What this doesn&rsquo;t do (yet)

- **Outlook / Microsoft 365** &mdash; uses Microsoft Graph instead
  of the Gmail API. Same schema, different OAuth + send path; on
  the Phase 17 follow-up list.
- **Bulk sends through Gmail&rsquo;s API** &mdash; Gmail rate-limits
  sends per second. For lists larger than a few hundred, we still
  recommend Mailgun. The campaign sender batches automatically.
- **Per-campaign sender selection** &mdash; right now we use the
  campaign creator&rsquo;s connection. A future pass will let you
  pick a specific connected account per campaign.

## Try asking the help agent

- "How do I send campaigns from my own Gmail?"
- "Why are my emails going to spam from the platform address?"
- "Can I disconnect Gmail without losing my campaign history?"
',
  'fan-engagement',
  array['email', 'gmail', 'oauth', 'campaigns', 'marketing']
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
