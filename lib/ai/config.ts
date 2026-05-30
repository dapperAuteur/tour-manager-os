import { createAdminClient } from '@/lib/supabase/admin'

// Hybrid model config: admin-written DB overrides take precedence,
// then env vars, then hardcoded defaults. Cached in-process for 30s
// so a high-traffic agent doesn't hammer the ai_config row.
//
// Call sites use getChatModel() / getEmbeddingModel() — never read
// process.env directly so the DB override path always wins.

export type AiConfigKey = 'chat_model' | 'embedding_model' | 'vision_model'

const DEFAULTS: Record<AiConfigKey, string> = {
  chat_model: 'cerebras/gpt-oss-120b',
  embedding_model: 'mistral/mistral-embed',
  vision_model: 'openrouter/anthropic/claude-sonnet-4.6',
}

const ENV_KEYS: Record<AiConfigKey, string> = {
  chat_model: 'AI_CHAT_MODEL',
  embedding_model: 'AI_EMBEDDING_MODEL',
  vision_model: 'AI_VISION_MODEL',
}

const CACHE_TTL_MS = 30_000

interface CacheEntry {
  value: string | null
  expiresAt: number
}

const cache = new Map<AiConfigKey, CacheEntry>()

async function fetchDbValue(key: AiConfigKey): Promise<string | null> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('ai_config')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    return data?.value ?? null
  } catch {
    return null
  }
}

export async function getAiModel(key: AiConfigKey): Promise<string> {
  const now = Date.now()
  const cached = cache.get(key)
  let dbValue: string | null
  if (cached && cached.expiresAt > now) {
    dbValue = cached.value
  } else {
    dbValue = await fetchDbValue(key)
    cache.set(key, { value: dbValue, expiresAt: now + CACHE_TTL_MS })
  }
  if (dbValue) return dbValue
  const envValue = process.env[ENV_KEYS[key]]
  if (envValue) return envValue
  return DEFAULTS[key]
}

export async function getChatModel(): Promise<string> {
  return getAiModel('chat_model')
}

export async function getEmbeddingModel(): Promise<string> {
  return getAiModel('embedding_model')
}

export async function getVisionModel(): Promise<string> {
  return getAiModel('vision_model')
}

// Admin write — invalidates the cache so the next read picks up the
// new value immediately on this instance. Other server instances see
// the change at their next cache expiry (≤30s).
export async function setAiModel(
  key: AiConfigKey,
  value: string,
  updatedByUserId: string,
): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('ai_config')
    .upsert(
      { key, value, updated_by_user_id: updatedByUserId, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    )
  cache.delete(key)
}

export async function clearAiModelOverride(key: AiConfigKey): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('ai_config').delete().eq('key', key)
  cache.delete(key)
}

// Surfaces the resolved config for the admin page.
export interface ResolvedConfig {
  key: AiConfigKey
  resolved: string
  source: 'db' | 'env' | 'default'
  envValue: string | null
  defaultValue: string
}

export async function getResolvedAiConfig(): Promise<ResolvedConfig[]> {
  const keys: AiConfigKey[] = ['chat_model', 'embedding_model', 'vision_model']
  const supabase = createAdminClient()
  const { data: rows } = await supabase.from('ai_config').select('key, value')
  const dbMap = new Map((rows || []).map((r) => [r.key as AiConfigKey, r.value]))
  return keys.map((key) => {
    const dbValue = dbMap.get(key)
    const envValue = process.env[ENV_KEYS[key]] || null
    const defaultValue = DEFAULTS[key]
    let resolved: string
    let source: ResolvedConfig['source']
    if (dbValue) {
      resolved = dbValue
      source = 'db'
    } else if (envValue) {
      resolved = envValue
      source = 'env'
    } else {
      resolved = defaultValue
      source = 'default'
    }
    return { key, resolved, source, envValue, defaultValue }
  })
}
