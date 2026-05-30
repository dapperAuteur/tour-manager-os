import { embed } from 'ai'
import { traceable } from 'langsmith/traceable'
import { logError } from '@/lib/observability/logger'

// Default embedding model. Override via AI_EMBEDDING_MODEL env var if
// you switch providers — but remember the help_articles.embedding
// column is sized for mistral-embed's 1024 dimensions. Changing
// dimensions requires a new migration recreating the column + index.
const DEFAULT_EMBEDDING_MODEL = 'mistral/mistral-embed'
const DEFAULT_EMBEDDING_DIMS = 1024

export function getEmbeddingModel(): string {
  return process.env.AI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL
}

export function getEmbeddingDims(): number {
  const raw = process.env.AI_EMBEDDING_DIMS
  if (raw) {
    const n = Number.parseInt(raw, 10)
    if (Number.isFinite(n) && n > 0) return n
  }
  return DEFAULT_EMBEDDING_DIMS
}

// Internal — no tracing wrapper here; that's added below.
async function _embedTextOnce(text: string): Promise<number[] | null> {
  if (!text || !text.trim()) return null
  try {
    const result = await embed({
      model: getEmbeddingModel(),
      value: text,
    })
    return result.embedding
  } catch (err) {
    logError('ai.embed.failed', err, {
      model: getEmbeddingModel(),
      input_length: text.length,
    })
    return null
  }
}

// Public — wraps each call in a LangSmith traceable so the prompt,
// model, latency, and embedding dimensions are queryable in
// LangSmith. The wrapper is a no-op when LANGSMITH_TRACING is unset
// or "false", so dev and tests don't ping LangSmith.
export const embedText = traceable(_embedTextOnce, {
  name: 'embedText',
  run_type: 'embedding',
})

// Convenience wrapper that returns the embedding cast to the format
// pgvector accepts in a Supabase RPC call — i.e. a plain number[].
export async function embedForVectorStore(
  text: string,
): Promise<number[] | null> {
  return embedText(text)
}
