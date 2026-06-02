-- ============================================================
-- HELP ARTICLE: Drag-and-drop stage plot editor
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000013',
  'Building a stage plot you can send to a venue',
  'stage-plot-editor',
  'features',
  '# Building a stage plot you can send to a venue

Every venue wants a stage plot in advance. The drag-and-drop editor
at `/production/stage-plots/[id]` produces a clean, named, sized
layout you can screenshot or print and email to the venue tech.

## How to build one

1. Open `/production/stage-plots` and click **New Plot**. Fill in
   the name, dimensions, and tie it to a specific show if it&rsquo;s
   a one-off layout (skip for &ldquo;our default rig&rdquo;).
2. Saving drops you straight into the editor.
3. On the left, the **Add to stage** palette has nine pieces:
   drum kit, guitar amp, bass amp, keys, monitor, mic stand, DI
   box, riser, and a generic "Other" for anything we don&rsquo;t
   have a chip for.
4. Click a piece to drop it on the canvas. Drag it anywhere on
   the stage with your pointer or finger.
5. Click a placed piece to select it. The **Selected** panel on
   the left lets you rename it (e.g. "Lead vox mic"), resize it,
   or remove it. The Delete / Backspace key also removes the
   currently-selected piece.
6. Click **Save** (or hit `⌘S` / `Ctrl S`) to persist.

## Coordinates and resolution

- Positions are stored as **percent of stage width / depth** in
  the `stage_plots.elements` JSON. That means the layout looks
  right whether the canvas is rendered at 600px on a phone or
  printed at letter size.
- The canvas is 16:9 with the **upstage** label at the top
  (the back of the stage, monitors typically face this way) and
  **downstage** at the bottom (toward the audience).
- The width and depth fields at the top of the editor are
  metadata only &mdash; we don&rsquo;t scale the canvas to them
  yet, but the venue tech reads them when they get the plot.

## Saving + autosave

The editor doesn&rsquo;t autosave. The header chip shows
&ldquo;Unsaved changes&rdquo; whenever you&rsquo;ve dragged a
piece or edited a label since the last save. Click **Save** or
press `⌘S` before you close the tab.

## Sharing a plot

For now the easiest path is:

1. Open the editor on the layout you want to share.
2. Use your OS&rsquo;s screenshot tool to grab the canvas.
3. Drop the image into an email or attach it to an advance sheet.

A native PDF export is on the Phase 15 follow-up list.

## Try asking the help agent

- "How do I drag instruments onto the stage plot?"
- "Can I tie a stage plot to a specific show?"
- "How do I delete a piece on the stage plot?"
',
  'production',
  array['production', 'stage-plot', 'editor', 'venue']
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
