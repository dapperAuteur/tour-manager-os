-- ============================================================
-- HELP ARTICLE: Multi-tenant custom-domain routing
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000014',
  'Pointing a custom domain at your Tour Manager OS storefront',
  'custom-domain-routing',
  'features',
  '# Pointing a custom domain at your Tour Manager OS storefront

Once your org has a verified custom domain
(set up at `/admin/white-label`), fans landing on the bare root of
that domain now arrive directly at your storefront — no
`/store/<your-slug>` in the URL, no Tour Manager OS marketing page
in front of your merch.

## How it works

1. The Next.js middleware at `middleware.ts` reads the request
   `host` on every page load.
2. Platform hosts (`tour.witus.online`, `*.vercel.app`, localhost)
   skip the lookup and serve the standard product.
3. Any other host is matched against the `custom_domains` table
   for a row with `verified = true`.
4. On a match:
   - `/` is **rewritten** (not redirected) to `/store/<your-slug>`
     so the URL bar stays clean.
   - All other paths pass through unchanged but pick up two
     headers: `x-tmos-tenant-host` (your verified domain) and
     `x-tmos-tenant-org` (your org slug).
5. Downstream server components call
   `currentTenant()` from `lib/multi-tenant/resolver.ts` to read
   those headers and adapt — the white-label theme already does
   this via `BrandTheme`, and individual pages can branch off
   `tenant.org_slug` when they need tenancy-specific copy.

A 60-second in-process cache keeps the host&rarr;org lookup off the
database on the hot path. The first request to a new domain pays
the lookup cost; subsequent ones in the same lambda instance are
served from memory.

## What you need to set up

1. Buy a domain at your registrar (Namecheap, Cloudflare, etc.).
2. Add it on `/admin/white-label` &rarr; **Custom Domains**.
3. Follow the DNS verification flow — a single CNAME record
   pointed at the platform&rsquo;s wildcard endpoint, plus a
   `_tmos-verify` TXT record we generate for you. Verification
   flips `custom_domains.verified` to `true`.
4. Wait ~60 seconds for the cache to expire (or redeploy to
   evict). Hit your domain&rsquo;s root and you should land on
   your storefront.

## What gets served on your custom domain

- `/` &rarr; storefront for your org.
- `/store/<your-slug>` &rarr; the same storefront, direct.
- `/store/<your-slug>/checkout/<product-id>` &rarr; Stripe
  Elements checkout (already part of merch).
- `/login`, `/signup` &rarr; the standard auth flow — these
  still need a Tour Manager OS account, the custom domain just
  rewraps the UI.

## What is *not* served (yet)

- The marketing site (`/for/*`, `/features/*`, `/roadmap`) still
  renders if a fan hits those paths on a custom domain. We&rsquo;ll
  scope this down in a follow-up so a custom domain only
  exposes storefront + auth.
- Cross-tenant deep links won&rsquo;t rewrite (e.g.
  `your-band.com/tours/abc/finances` still resolves the way
  the path itself reads). Tenant-scoped page rewriting is a
  Phase 19 follow-up.

## Try asking the help agent

- "How do I point my band&rsquo;s domain at my storefront?"
- "Why is my custom domain still showing the Tour Manager OS landing page?"
- "Can I have multiple custom domains pointing at the same org?"
',
  null,
  array['white-label', 'custom-domain', 'middleware', 'multi-tenant']
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
