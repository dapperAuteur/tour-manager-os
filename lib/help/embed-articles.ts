'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { embedText, getEmbeddingModel } from '@/lib/ai/gateway'
import { logError, logEvent } from '@/lib/observability/logger'

interface BackfillResult {
  scanned: number
  embedded: number
  failed: number
  skipped: number
}

// Builds the text we embed. Title + content gives the model both the
// indexing signal and the contextual body. Cap to a sane length so a
// single huge article doesn't blow the model's input window.
const MAX_INPUT_CHARS = 12_000

function articleText(title: string, content: string): string {
  const combined = `${title}\n\n${content}`
  return combined.length > MAX_INPUT_CHARS
    ? combined.slice(0, MAX_INPUT_CHARS)
    : combined
}

// Embeds a single article by id. Use when an article is created or
// updated so the embedding stays in sync with the content. Safe to
// call repeatedly — idempotent on the (id, current model) tuple.
export async function embedHelpArticle(articleId: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data: article, error } = await supabase
    .from('help_articles')
    .select('id, title, content')
    .eq('id', articleId)
    .maybeSingle()
  if (error || !article) return false

  const text = articleText(article.title || '', article.content || '')
  const embedding = await embedText(text)
  if (!embedding) return false

  const { error: updateErr } = await supabase
    .from('help_articles')
    .update({
      embedding: embedding as unknown as string,
      embedding_model: getEmbeddingModel(),
      embedded_at: new Date().toISOString(),
    })
    .eq('id', articleId)

  if (updateErr) {
    logError('help.embed.update_failed', updateErr, { article_id: articleId })
    return false
  }
  return true
}

// Backfill missing or stale embeddings. Stale = embedding_model
// doesn't match the current AI_EMBEDDING_MODEL env. Returns a
// summary so an admin tool can show progress.
export async function backfillHelpEmbeddings(): Promise<BackfillResult> {
  const supabase = createAdminClient()
  const currentModel = getEmbeddingModel()

  const { data: articles, error } = await supabase
    .from('help_articles')
    .select('id, title, content, embedding_model')
    .or(`embedding_model.is.null,embedding_model.neq.${currentModel}`)
    .limit(200)

  if (error || !articles) {
    logError('help.backfill.fetch_failed', error, {})
    return { scanned: 0, embedded: 0, failed: 0, skipped: 0 }
  }

  let embedded = 0
  let failed = 0
  let skipped = 0

  for (const a of articles) {
    if (!a.title && !a.content) {
      skipped++
      continue
    }
    const ok = await embedHelpArticle(a.id)
    if (ok) embedded++
    else failed++
  }

  logEvent('help.backfill.complete', {
    scanned: articles.length,
    embedded,
    failed,
    skipped,
    model: currentModel,
  })

  return {
    scanned: articles.length,
    embedded,
    failed,
    skipped,
  }
}
