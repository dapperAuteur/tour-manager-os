-- ============================================================
-- HELP ARTICLE: Runtime brand theme injection (white label)
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000000f',
  'Skinning Tour Manager OS to your organization brand',
  'white-label-runtime-theme',
  'features',
  '# Skinning Tour Manager OS to your organization brand

When you enable white-label on `/admin/white-label`, the entire
authenticated app re-skins to your organization&rsquo;s primary
color in real time. No deploy, no CSS edits — set the color, save,
refresh.

## How it works

1. You pick a **Primary color** on `/admin/white-label` and tick
   **Enable white label branding**.
2. On every authenticated page load we read your org&rsquo;s
   `brand_primary_color` and derive a full 50&ndash;900 palette
   using HSL math (`lib/white-label/runtime-theme.ts` &rarr;
   `shadesFromHex`). Your chosen color anchors the **600** slot
   (where the default `#4553ea` lives) and the lighter and darker
   shades ramp around it on a fixed lightness curve.
3. A small `<BrandTheme>` server component renders an inline
   `<style>` element that overrides the `--color-primary-*` CSS
   custom properties on `:root`.
4. Every Tailwind class that resolves to a primary token
   (`bg-primary-600`, `text-primary-700`, `ring-primary-500`,
   etc.) instantly picks up your color.

The default Tour Manager OS theme is restored automatically the
moment you untick **Enable white label branding** &mdash; we don&rsquo;t
inject any styles when white-label is off, so nothing breaks if
you turn it off mid-tour.

## Previewing your palette before save

The color picker on `/admin/white-label` shows a row of nine
swatches under it. Each is a label-numbered chip of one shade in
your derived palette. Hover for the exact hex; if any one looks
wrong (too dark on hover backgrounds, low contrast on text), pick
a different base color &mdash; the curve is fixed, so the only knob
you have is the starting hex.

## What this does not cover

- **Fonts**: the **Font Family** dropdown picks the value but we
  don&rsquo;t inject the @font-face yet. Use **Custom CSS** for that
  for now.
- **Logos**: `brand_logo_url` is saved on your org, but the public
  nav still shows the Tour Manager OS wordmark. Logo wiring is on
  the Phase 19 follow-up list.
- **Public pages**: the homepage and `/for/*` landing pages still
  use the default Tour Manager OS theme. Runtime injection is
  scoped to the authenticated app for now.
- **Multi-tenant domain routing**: still on Phase 19 &mdash; the
  theme follows your auth session, not a `*.your-domain.com`
  subdomain.

## Try asking the help agent

- "How do I change the button color for my band?"
- "Where do I set the org logo?"
- "Can fans see my white-label theme on the public store?"
',
  null,
  array['white-label', 'theme', 'branding', 'admin']
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
