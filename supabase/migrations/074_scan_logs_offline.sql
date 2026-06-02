-- ============================================================
-- OFFLINE SCAN RECONCILIATION
-- Adds the original-scan timestamp + a "this row arrived from an
-- offline queue" flag to scan_logs so the timeline reflects when
-- the door scan actually happened, not when the device caught up
-- with connectivity.
-- ============================================================

alter table scan_logs
  add column if not exists offline_scanned_at timestamptz,
  add column if not exists synced_from_offline boolean default false;

create index if not exists scan_logs_offline_idx
  on scan_logs(synced_from_offline) where synced_from_offline = true;

comment on column scan_logs.offline_scanned_at is
  'When the scanner actually decoded the QR. NULL for online scans (use created_at). Set when sync drains an IndexedDB queue.';
comment on column scan_logs.synced_from_offline is
  'True when this scan was queued on a disconnected device and synced later.';
