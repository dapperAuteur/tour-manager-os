'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import {
  type AiConfigKey,
  type ResolvedConfig,
  getResolvedAiConfig,
  setAiModel,
  clearAiModelOverride,
} from '@/lib/ai/config'
import { embedText } from '@/lib/ai/gateway'

interface ProviderKeyStatus {
  envVar: string
  present: boolean
}

const PROVIDER_KEYS: ProviderKeyStatus[] = [
  { envVar: 'OPENROUTER_API_KEY', present: false },
  { envVar: 'CEREBRAS_API_KEY', present: false },
  { envVar: 'TOGETHER_API_KEY', present: false },
  { envVar: 'MISTRAL_API_KEY', present: false },
  { envVar: 'AI_GATEWAY_API_KEY', present: false },
  { envVar: 'LANGSMITH_API_KEY', present: false },
]

async function requireSuperAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    throw new Error('forbidden')
  }
  return user
}

export async function getAdminAiOverview() {
  await requireSuperAdmin()

  const [config, providerKeys, embeddings, recent] = await Promise.all([
    getResolvedAiConfig(),
    Promise.resolve(
      PROVIDER_KEYS.map((p) => ({
        ...p,
        present: Boolean(process.env[p.envVar]),
      })),
    ),
    getEmbeddingsStats(),
    getRecentChatLogs(20),
  ])

  const langsmithProject = process.env.LANGSMITH_PROJECT || null
  const langsmithTracing = process.env.LANGSMITH_TRACING === 'true'

  return {
    config,
    providerKeys,
    embeddings,
    recent,
    langsmith: {
      project: langsmithProject,
      tracingEnabled: langsmithTracing,
      apiKeyPresent: Boolean(process.env.LANGSMITH_API_KEY),
    },
  }
}

interface EmbeddingsStats {
  total: number
  embedded: number
  staleModel: number
  unembedded: number
  currentModel: string
}

async function getEmbeddingsStats(): Promise<EmbeddingsStats> {
  const admin = createAdminClient()
  const { getEmbeddingModel } = await import('@/lib/ai/config')
  const currentModel = await getEmbeddingModel()

  const [{ count: total }, { count: embedded }, { count: stale }] =
    await Promise.all([
      admin
        .from('help_articles')
        .select('*', { count: 'exact', head: true })
        .eq('published', true),
      admin
        .from('help_articles')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
        .not('embedding', 'is', null),
      admin
        .from('help_articles')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
        .not('embedding', 'is', null)
        .neq('embedding_model', currentModel),
    ])

  const totalN = total ?? 0
  const embeddedN = embedded ?? 0
  return {
    total: totalN,
    embedded: embeddedN,
    staleModel: stale ?? 0,
    unembedded: Math.max(0, totalN - embeddedN),
    currentModel,
  }
}

interface ChatLogRow {
  id: string
  user_id: string | null
  question: string
  top_similarity: number | null
  model: string
  prompt_tokens: number | null
  completion_tokens: number | null
  total_tokens: number | null
  response_time_ms: number | null
  error: string | null
  created_at: string
  retrieved_article_ids: string[] | null
}

async function getRecentChatLogs(limit: number): Promise<ChatLogRow[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('ai_chat_logs')
    .select(
      'id, user_id, question, top_similarity, model, prompt_tokens, completion_tokens, total_tokens, response_time_ms, error, created_at, retrieved_article_ids',
    )
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []) as ChatLogRow[]
}

export async function updateAiModelAction(
  key: AiConfigKey,
  value: string,
): Promise<{ ok: true; resolved: ResolvedConfig[] } | { ok: false; error: string }> {
  const user = await requireSuperAdmin().catch(() => null)
  if (!user) return { ok: false, error: 'forbidden' }
  const trimmed = value.trim()
  if (!trimmed) return { ok: false, error: 'value required' }
  await setAiModel(key, trimmed, user.id)
  return { ok: true, resolved: await getResolvedAiConfig() }
}

export async function clearAiModelOverrideAction(
  key: AiConfigKey,
): Promise<{ ok: true; resolved: ResolvedConfig[] } | { ok: false; error: string }> {
  const user = await requireSuperAdmin().catch(() => null)
  if (!user) return { ok: false, error: 'forbidden' }
  await clearAiModelOverride(key)
  return { ok: true, resolved: await getResolvedAiConfig() }
}

export interface ProviderHealth {
  provider: string
  model: string
  ok: boolean
  latencyMs: number | null
  error: string | null
}

// Each provider is pinged with a single small embedding call (cheap,
// fast, no streaming). Models picked from each provider's catalog.
const HEALTH_TARGETS: { provider: string; model: string }[] = [
  { provider: 'Mistral', model: 'mistral/mistral-embed' },
  { provider: 'OpenRouter', model: 'openrouter/mistralai/mistral-7b-instruct' },
  { provider: 'Cerebras', model: 'cerebras/llama3.3-70b' },
  { provider: 'Together', model: 'together/meta-llama/Llama-3.3-70B-Instruct-Turbo' },
]

export async function runProviderHealthChecks(): Promise<ProviderHealth[]> {
  await requireSuperAdmin()

  // We embed a tiny string against each provider in parallel. For
  // chat-only providers, we still use embedText since it's the
  // simplest cheap call; the AI Gateway can route to the right
  // provider via the model string.
  const probes = HEALTH_TARGETS.map(async (t) => {
    const start = Date.now()
    try {
      const result = await pingProvider(t.model)
      return {
        provider: t.provider,
        model: t.model,
        ok: result,
        latencyMs: Date.now() - start,
        error: null,
      }
    } catch (err) {
      return {
        provider: t.provider,
        model: t.model,
        ok: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : 'unknown',
      }
    }
  })
  return Promise.all(probes)
}

// Reuses embedText for embedding-capable models. For chat-only
// models (cerebras llama, together llama), uses a one-token completion.
// Routes through the direct-provider resolver so the Vercel AI
// Gateway credit-card requirement doesn't gate health checks.
async function pingProvider(modelString: string): Promise<boolean> {
  const isEmbedding = modelString.includes('embed')
  if (isEmbedding) {
    const vec = await embedText('ping')
    return Array.isArray(vec) && vec.length > 0
  }
  const { generateText } = await import('ai')
  const { resolveChatModel } = await import('@/lib/ai/providers')
  const result = await generateText({
    model: resolveChatModel(modelString),
    prompt: 'Reply with one word: ok',
    maxOutputTokens: 8,
  })
  return Boolean(result.text)
}
