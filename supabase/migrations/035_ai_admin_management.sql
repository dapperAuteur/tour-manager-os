-- ============================================================
-- ADMIN AI MANAGEMENT
-- Adds two tables:
--   ai_config     — hot-swappable per-key model overrides (admin UI
--                   writes here; code reads DB then falls back to
--                   the env var so deploys still work uncustomized)
--   ai_chat_logs  — one row per /api/help/ask invocation with
--                   retrieval + token + latency + error metadata.
--                   Powers the recent-activity + cost views.
-- ============================================================

create table ai_config (
  key text primary key,
  value text not null,
  updated_by_user_id uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now()
);

alter table ai_config enable row level security;

-- ai_config is super-admin-only. Server actions call from server-side
-- with the admin client so RLS doesn't gate them; we add an
-- authenticated-read policy so a future feature flag UI can show
-- the current model to non-admins safely.
create policy "ai_config_authenticated_read"
  on ai_config for select
  using (auth.uid() is not null);

-- No INSERT/UPDATE/DELETE policies — only the service_role client
-- (used by the super-admin server actions) can write.

-- ============================================================
create table ai_chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  question text not null,
  retrieved_article_ids uuid[] default '{}',
  top_similarity numeric(5,4),
  model text not null,
  prompt_tokens int,
  completion_tokens int,
  total_tokens int generated always as (
    coalesce(prompt_tokens, 0) + coalesce(completion_tokens, 0)
  ) stored,
  response_time_ms int,
  error text,
  created_at timestamptz default now()
);

create index ai_chat_logs_user_id_idx on ai_chat_logs(user_id);
create index ai_chat_logs_created_at_idx on ai_chat_logs(created_at desc);

alter table ai_chat_logs enable row level security;

-- Posters read their own conversations (future: a per-user "history"
-- view).
create policy "ai_chat_logs_own_select"
  on ai_chat_logs for select
  using (user_id = auth.uid());

-- Writes are server-side via the admin client; no client-facing
-- INSERT policy.
