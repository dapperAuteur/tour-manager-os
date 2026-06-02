/**
 * Tiny IndexedDB wrapper for the door scanner. Two stores:
 *
 *   - manifest: per-show snapshot of ticket ids + status. Pre-fetched
 *     while the scanner is online and consulted when the network
 *     drops so we can still validate IDs and surface single-use
 *     decisions at the door.
 *
 *   - queue: scans captured while offline. Each row carries the QR
 *     payload + decoded id + the timestamp we observed it. Drained
 *     when connectivity returns by POSTing to /api/tickets/scan
 *     with offline_scanned_at set so the audit trail reflects door
 *     reality.
 *
 * No external dep — uses the raw IndexedDB API. Browser-only; the
 * `pushSupported`-style check is the caller's responsibility.
 */

const DB_NAME = 'tmos.scanner'
const DB_VERSION = 1
const STORE_MANIFEST = 'manifest'
const STORE_QUEUE = 'queue'

export interface ManifestEntry {
  id: string
  status: 'issued' | 'used' | 'refunded' | 'void'
  /** Last time we marked it used locally (offline). Drives the
   *  "already used" decision when the same QR is rescanned offline. */
  local_used_at?: number
}

export interface QueuedScan {
  /** Stable key — usually the QR payload string + show_id. */
  key: string
  show_id: string
  qr: string
  ticket_id: string | null
  offline_scanned_at: string
  attempts: number
}

interface ManifestRow {
  show_id: string
  generated_at: string
  tickets: ManifestEntry[]
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_MANIFEST)) {
        db.createObjectStore(STORE_MANIFEST, { keyPath: 'show_id' })
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(store, mode)
    const s = t.objectStore(store)
    const req = run(s)
    if (req instanceof IDBRequest) {
      req.onsuccess = () => resolve(req.result as T)
      req.onerror = () => reject(req.error)
    } else {
      req.then(resolve, reject)
    }
  })
}

export async function saveManifest(
  showId: string,
  generatedAt: string,
  tickets: { id: string; status: ManifestEntry['status'] }[],
): Promise<void> {
  const row: ManifestRow = {
    show_id: showId,
    generated_at: generatedAt,
    tickets: tickets.map((t) => ({ id: t.id, status: t.status })),
  }
  await tx(STORE_MANIFEST, 'readwrite', (s) => s.put(row))
}

export async function readManifest(
  showId: string,
): Promise<ManifestRow | null> {
  const row = await tx<ManifestRow | undefined>(STORE_MANIFEST, 'readonly', (s) =>
    s.get(showId),
  )
  return row ?? null
}

export async function manifestLookup(
  showId: string,
  ticketId: string,
): Promise<ManifestEntry | null> {
  const row = await readManifest(showId)
  if (!row) return null
  return row.tickets.find((t) => t.id === ticketId) ?? null
}

export async function markManifestUsedLocally(
  showId: string,
  ticketId: string,
): Promise<void> {
  const row = await readManifest(showId)
  if (!row) return
  const entry = row.tickets.find((t) => t.id === ticketId)
  if (!entry) return
  entry.status = 'used'
  entry.local_used_at = Date.now()
  await tx(STORE_MANIFEST, 'readwrite', (s) => s.put(row))
}

export async function enqueueScan(scan: QueuedScan): Promise<void> {
  await tx(STORE_QUEUE, 'readwrite', (s) => s.put(scan))
}

export async function listQueue(): Promise<QueuedScan[]> {
  return tx<QueuedScan[]>(STORE_QUEUE, 'readonly', (s) =>
    s.getAll() as unknown as IDBRequest<QueuedScan[]>,
  )
}

export async function removeFromQueue(key: string): Promise<void> {
  await tx(STORE_QUEUE, 'readwrite', (s) => s.delete(key))
}

export async function bumpQueueAttempts(key: string): Promise<void> {
  const existing = await tx<QueuedScan | undefined>(
    STORE_QUEUE,
    'readonly',
    (s) => s.get(key),
  )
  if (!existing) return
  existing.attempts++
  await tx(STORE_QUEUE, 'readwrite', (s) => s.put(existing))
}

export async function queueSize(): Promise<number> {
  return tx<number>(STORE_QUEUE, 'readonly', (s) =>
    s.count() as unknown as IDBRequest<number>,
  )
}
