import { createAdminClient } from '@/lib/supabase/admin'
import { embedText } from '@/lib/ai/gateway'
import { logError } from '@/lib/observability/logger'

export interface RetrievedArticle {
  id: string
  slug: string
  title: string
  content: string
  category: string | null
  similarity: number
}

const DEFAULT_TOP_K = 5
const DEFAULT_MIN_SIMILARITY = 0.5

// Semantic retrieval: embed the question, return the top-K matching
// help articles above a similarity floor. Used by the conversational
// agent to ground answers; returns [] when embeddings are unavailable
// so the caller can fall back to a generic response.
export async function retrieveHelpArticles(
  query: string,
  topK = DEFAULT_TOP_K,
  minSimilarity = DEFAULT_MIN_SIMILARITY,
): Promise<RetrievedArticle[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const embedding = await embedText(trimmed)
  if (!embedding) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('match_help_articles', {
    query_embedding: embedding as unknown as string,
    match_count: topK,
    min_similarity: minSimilarity,
  })

  if (error) {
    logError('help.retrieve.rpc_failed', error, { query: trimmed })
    return []
  }

  return (data || []) as RetrievedArticle[]
}
