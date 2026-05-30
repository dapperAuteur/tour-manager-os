-- ============================================================
-- HELP-ARTICLE EMBEDDINGS (audit recommendation #2 — Phase 11 last gap)
-- Adds pgvector + a 1024-dim embedding column on help_articles so
-- semantic search can replace the pg_trgm fuzzy-only path.
--
-- Dimension = 1024 to match Mistral's `mistral-embed` (the default
-- AI_EMBEDDING_MODEL). Changing model dimensions requires a new
-- migration that recreates the column + index.
-- ============================================================

create extension if not exists vector with schema extensions;

alter table help_articles
  add column if not exists embedding extensions.vector(1024),
  add column if not exists embedding_model text,
  add column if not exists embedded_at timestamptz;

-- HNSW index for cosine similarity. cosine matches the standard
-- embedding-similarity metric and is what `1 - (embedding <=> q)`
-- expects to read as "higher = more similar".
create index if not exists help_articles_embedding_hnsw
  on help_articles
  using hnsw (embedding extensions.vector_cosine_ops);

-- Helper RPC for the search path. Returns the top-N most similar
-- articles to a query embedding, with similarity score in [0, 1].
-- SECURITY INVOKER so existing RLS on help_articles still applies.
create or replace function public.match_help_articles(
  query_embedding extensions.vector(1024),
  match_count int default 5,
  min_similarity float default 0.5
)
returns table (
  id uuid,
  slug text,
  title text,
  content text,
  category text,
  similarity float
)
language sql
stable
security invoker
as $$
  select
    ha.id,
    ha.slug,
    ha.title,
    ha.content,
    ha.category,
    1 - (ha.embedding <=> query_embedding) as similarity
  from public.help_articles ha
  where ha.embedding is not null
    and 1 - (ha.embedding <=> query_embedding) >= min_similarity
  order by ha.embedding <=> query_embedding
  limit match_count
$$;

grant execute on function public.match_help_articles(extensions.vector(1024), int, float)
  to anon, authenticated, service_role;
