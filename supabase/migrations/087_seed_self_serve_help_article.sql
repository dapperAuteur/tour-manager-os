-- ============================================================
-- HELP ARTICLE: Self-serve setup — how to run the whole platform
-- without asking a developer
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000001a',
  'Self-serve setup — running Tour Manager OS on your own',
  'self-serve-setup',
  'getting-started',
  '# Self-serve setup — running Tour Manager OS on your own

Tour Manager OS is built so a touring family can run it without
keeping a dev on speed-dial. Every third-party integration we
support comes with a help article that walks **you**, the band
member, through the consent + connection flow. The AI help agent
on `/help` (it&rsquo;s aware of every article on this page) is
the second pair of eyes when anything sticks.

## What you can connect yourself

| Integration | Where to start | Help article |
| --- | --- | --- |
| Cloudinary (receipts, fan photos, venue photos) | `/admin/cloudinary` | *Setting up Cloudinary uploads* |
| Stripe (ticket + merch checkout) | `/admin/stripe` | *Activating ticket + merch sales* |
| Stripe Connect (split revenue across artist / venue / crew) | `/admin/stripe-connect` | `stripe-connect-splits`, `stripe-connect-payouts` |
| Shippo (live merch shipping rates) | `/admin/shippo` | *Live shipping rates with Shippo* |
| Mailgun (platform email fallback) | `/admin/mailgun` | *Email campaign sending* |
| **Gmail send-as** (your own address) | `/settings` &rarr; Email sender | `gmail-send-as` |
| **Web push** (schedule alerts) | `/settings` &rarr; Push notifications | `push-notifications` |
| **Apple Wallet** (.pkpass ticket delivery) | Ticket page &rarr; Add to Apple Wallet | `apple-wallet-tickets` |
| Custom domain (white label) | `/admin/white-label` | `custom-domain-routing` |

Every page above checks the env vars itself. When something
isn&rsquo;t configured, the section shows you exactly what env
var is missing and links to the matching help article — no need
to dig through Vercel.

## When the article says "operator task"

A few integrations require touching a third-party console
(Google Cloud, Apple Developer, Stripe Dashboard) to provision
keys / certs that then ship to the platform via env vars. The
relevant articles link to a `plans/user-tasks/NN-*.md` file with
step-by-step instructions. **You can follow those yourself** if
you have access to the platform&rsquo;s Vercel project — they
are not engineer-only.

If you have a deployed copy of Tour Manager OS on your own
Vercel account (the standard self-host pattern), you own all of
those consoles already. Read the file, follow the steps, paste
the keys into Vercel, redeploy. The article will pick up the new
config on the next page load.

## Getting unstuck

1. **Ask the AI help agent first.** Open `/help`. Ask in plain
   English — "how do I send campaigns from my band email", "why
   isn&rsquo;t my push notification arriving", "what env vars do I
   need to enable Stripe Connect". The agent cites the
   underlying article so you know exactly which doc to read.
2. **Browse the help articles** at `/help` for anything
   integration-shaped. The category filter narrows to the module
   you&rsquo;re working on.
3. **File feedback** at `/feedback` if something genuinely
   blocks you. We mirror those threads into a cross-product
   triage queue so they don&rsquo;t fall through.

## What we will not let you do

- Touch other organizations&rsquo; data. RLS keeps every band
  scoped to their own org.
- Spend more than you intend. Every paid integration (Stripe,
  Mailgun, Cloudinary, Shippo) is **opt-in** and disabled until
  you connect a real account.
- Lock yourself out. Connections (Gmail, Stripe Connect, push
  subscriptions, Wallet) all have a one-click **Disconnect** in
  the same settings page.

## Try asking the help agent

- "How do I set up Stripe Connect for my band?"
- "Who do I ask for help if a setting isn&rsquo;t configured?"
- "Can I run Tour Manager OS without a developer?"
',
  null,
  array['getting-started', 'self-serve', 'help', 'onboarding', 'integrations']
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
