-- ============================================================
-- HELP ARTICLE: Offline ticket scanner cache
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000011',
  'Scanning tickets when the venue Wi-Fi drops',
  'offline-ticket-scanner',
  'features',
  '# Scanning tickets when the venue Wi-Fi drops

The door scanner now works when the network does not. Open the
scanner on a connected device once; it caches the show&rsquo;s
ticket manifest to your browser. From that point on, you can
scan QR codes offline and the decisions still happen at the door.

## How it works

1. **Pre-flight** — When you open
   `/tours/<tour-id>/shows/<show-id>/scanner` and you&rsquo;re
   online, the page calls `/api/tickets/manifest?show_id=...`
   and stores every issued / used ticket id in your browser&rsquo;s
   IndexedDB (`tmos.scanner` database). You only need to do this
   once per device per show.
2. **Offline scan** — When the browser flips to offline
   (`navigator.onLine === false`), the scanner:
   - Decodes the QR locally.
   - Looks the ticket id up in the cached manifest.
   - Returns **Admitted**, **Already used**, **Refunded**, **Void**,
     or **Not found** &mdash; same outcomes as the online flow.
   - Marks the ticket used locally so a duplicate scan on the same
     device produces **Already used**.
   - Queues the scan to a local IndexedDB queue.
3. **Sync** — When the browser comes back online, the queue
   drains automatically. Each queued scan is replayed to
   `/api/tickets/scan` with the original timestamp tagged as
   `offline_scanned_at`. The audit trail in `scan_logs` reflects
   when the door scan actually happened, not when sync caught up.

## The banner you&rsquo;ll see

Above the scanner there&rsquo;s a status banner:

- **Green** — Online; manifest cached and ready as a fallback.
- **Yellow** — Offline; scans queue locally.
- **&ldquo;N queued&rdquo; chip** — visible whenever there are
  unsynced scans, on either color. Stays until the queue drains.

## Caveats + best practices

- **Cache the manifest *before* doors open.** Pull up the scanner
  on the device while you&rsquo;ve still got service. If you
  arrive offline with no prior cache for that show, the offline
  fallback will reject every QR as **Not found**.
- **Two devices, one manifest each.** Each browser has its own
  IndexedDB &mdash; load the scanner on each device.
- **Signature verification happens server-side.** Forged QRs
  pass the offline lookup (the manifest only knows ids, not
  signatures). The server rejects them at sync time with
  `invalid_sig` and the scan_logs row stays for the audit. For
  high-security events, keep the device online if you can.
- **Refreshes.** Reopening the scanner page online refreshes the
  manifest. If a comp ticket got issued in the last 30 minutes
  and you went offline before refreshing, that ticket may show as
  **Not found** until you&rsquo;re back online.

## Try asking the help agent

- "Can I scan tickets without Wi-Fi?"
- "Where do offline scans go before sync?"
- "Why is the scanner saying Not found at the door?"
',
  null,
  array['ticketing', 'scanner', 'offline', 'indexeddb', 'show-day']
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
