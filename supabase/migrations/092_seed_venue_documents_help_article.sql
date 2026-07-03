-- ============================================================
-- HELP ARTICLE: Venue tech docs (sound, lights, video)
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-00000000001d',
  'Save a venue''s sound, lights, and video files',
  'venue-tech-docs',
  'features',
  '# Save a venue''s sound, lights, and video files

Every venue has a tech pack. It lists the sound system, the light
rig, the video setup, and the stage plot. Before this, that PDF
lived in someone''s email. Now you can attach it to the venue so
the whole team finds it fast.

## How to add a file

1. Open the venue from **Venues**.
2. Find the **Tech Docs** box.
3. Pick the type: Sound, Lights, Video, Stage plot, or Other.
4. Type a short title if you want. If you skip it, we use the
   file name.
5. Click **Upload file** and pick the file from your device.

The file shows up in the list right away. Anyone on your team can
click it to open it.

## What files work

- PDF
- Text (.txt)
- Markdown (.md)
- CSV (.csv)
- Images (jpg, png, webp)

Files can be up to 15 MB. A venue can hold up to 40 files.

## Why this helps

- The audio engineer sees the PA before load-in.
- The lighting tech sees the rig before the show.
- The tour manager stops digging through old email threads.
- New crew get up to speed in one click.

## Who can see and change these

Anyone on your team who can open the venue can see the files, add
new ones, and delete old ones. The venue network is shared, so a
file one band adds helps the next band that plays the room.

## Delete a file

Click the trash icon next to the file. Confirm. It is gone from
the list and from storage.

## What if I get stuck

- **Upload button does nothing.** File storage needs to be set
  up on the server. Ask the platform team, or check that the
  Cloudinary keys are set.
- **File will not open.** Make sure it finished uploading. Large
  files take a few seconds.
- Ask the help agent on `/help`. It knows this article.',
  null,
  array['venues', 'tech pack', 'sound', 'lights', 'video', 'documents']
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  module_id = excluded.module_id,
  tags = excluded.tags,
  updated_at = now();
