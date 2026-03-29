-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS help_articles_title_trgm_idx ON help_articles USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS help_articles_content_trgm_idx ON help_articles USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS feedback_threads_subject_trgm_idx ON feedback_threads USING gin (subject gin_trgm_ops);

-- ============================================================
-- ACTIVITY LOG
-- Tracks user actions for admin visibility.
-- ============================================================
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

create index activity_log_user_id_idx on activity_log(user_id);
create index activity_log_action_idx on activity_log(action);
create index activity_log_created_at_idx on activity_log(created_at desc);

alter table activity_log enable row level security;

-- Only super admin can read logs (via admin client)
-- No RLS select policy for normal users

-- ============================================================
-- FUZZY SEARCH FUNCTION
-- Returns help articles ranked by similarity to query.
-- ============================================================
create or replace function search_help_articles(query text)
returns table (
  id uuid,
  title text,
  slug text,
  content text,
  category text,
  module_id text,
  tags text[],
  similarity real
) as $$
  select
    h.id, h.title, h.slug, h.content, h.category, h.module_id, h.tags,
    greatest(
      similarity(h.title, query),
      similarity(h.content, query)
    ) as similarity
  from help_articles h
  where h.published = true
    and (
      h.title % query
      or h.content % query
      or h.title ilike '%' || query || '%'
      or h.content ilike '%' || query || '%'
      or h.category ilike '%' || query || '%'
    )
  order by similarity desc
  limit 20;
$$ language sql stable;

-- ============================================================
-- FUZZY SEARCH FOR FEEDBACK (admin)
-- ============================================================
create or replace function search_feedback_threads(query text)
returns table (
  id uuid,
  user_id uuid,
  subject text,
  category text,
  priority text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity real
) as $$
  select
    f.id, f.user_id, f.subject, f.category, f.priority, f.status,
    f.created_at, f.updated_at,
    similarity(f.subject, query) as similarity
  from feedback_threads f
  where
    f.subject % query
    or f.subject ilike '%' || query || '%'
    or f.category ilike '%' || query || '%'
  order by similarity desc
  limit 50;
$$ language sql stable;
