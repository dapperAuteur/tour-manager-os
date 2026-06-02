-- ============================================================
-- AI MODERATION PRE-FILTER FOR FAN PHOTOS
-- Adds verdict columns so a vision model can flag risky uploads
-- before they reach the human moderation queue. The model can either
-- auto-reject (high-confidence NSFW/violence) or flag for closer
-- attention. The existing queue keeps its tabs; verdict-decorated
-- rows just sort higher.
-- ============================================================

alter table fan_photos
  add column if not exists ai_moderation_verdict jsonb,
  add column if not exists ai_moderated_at timestamptz,
  add column if not exists ai_auto_rejected boolean default false;

create index if not exists fan_photos_ai_auto_rejected_idx
  on fan_photos(ai_auto_rejected) where ai_auto_rejected = true;

comment on column fan_photos.ai_moderation_verdict is
  'Structured vision-model output: {nsfw_likely, violence_likely, off_topic_likely, confidence, reason}.';
comment on column fan_photos.ai_auto_rejected is
  'True when the AI pre-filter rejected the photo before it hit the human queue.';
