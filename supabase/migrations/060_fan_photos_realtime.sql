-- ============================================================
-- REALTIME MODERATION QUEUE
-- Publish fan_photos to the supabase_realtime publication so the
-- admin queue can subscribe to inserts/updates and surface new
-- submissions without a manual refresh. We deliberately do NOT
-- enable replica identity full — the queue UI just needs row ids
-- + status, both of which are in the default replica identity.
-- ============================================================

alter publication supabase_realtime add table fan_photos;
