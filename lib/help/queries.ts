import { createClient } from '@/lib/supabase/server'
import { embedText } from '@/lib/ai/gateway'
import { logError } from '@/lib/observability/logger'

const SEMANTIC_MIN_SIMILARITY = 0.55
const SEMANTIC_MATCH_COUNT = 8

export async function getHelpArticles(search?: string) {
  const supabase = await createClient()

  if (search && search.trim()) {
    const query = search.trim()

    // 1) Try semantic search via embedded query → pgvector cosine.
    //    Falls through to fuzzy if embedding fails (model down, env
    //    missing) or returns zero hits above the similarity floor.
    try {
      const queryEmbedding = await embedText(query)
      if (queryEmbedding) {
        const { data: semantic, error: semErr } = await supabase.rpc(
          'match_help_articles',
          {
            query_embedding: queryEmbedding as unknown as string,
            match_count: SEMANTIC_MATCH_COUNT,
            min_similarity: SEMANTIC_MIN_SIMILARITY,
          },
        )
        if (!semErr && semantic && semantic.length > 0) {
          return semantic
        }
      }
    } catch (err) {
      logError('help.search.semantic_failed', err, { query })
    }

    // 2) Fuzzy fallback (pg_trgm).
    const { data: fuzzy, error: fuzzyErr } = await supabase.rpc(
      'search_help_articles',
      { query },
    )
    if (!fuzzyErr && fuzzy && fuzzy.length > 0) return fuzzy

    // 3) Last-resort ilike fallback.
    const { data: like } = await supabase
      .from('help_articles')
      .select('*')
      .eq('published', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`)
      .order('sort_order', { ascending: true })
    return like || []
  }

  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getHelpArticleBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) throw error
  return data
}
