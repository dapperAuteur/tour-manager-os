import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export interface ApiKeyData {
  id: string
  org_id: string
  scopes: string[]
  rate_limit: number
}

export async function validateApiKey(request: Request): Promise<ApiKeyData | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const key = authHeader.slice(7)
  const prefix = key.slice(0, 8)

  const supabase = createAdminClient()

  // Find key by prefix
  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, org_id, key_hash, scopes, rate_limit, active')
    .eq('key_prefix', prefix)
    .eq('active', true)

  if (!keys || keys.length === 0) return null

  // Verify hash
  for (const apiKey of keys) {
    const hash = crypto.createHash('sha256').update(key).digest('hex')
    if (hash === apiKey.key_hash) {
      // Check expiry
      // Update last_used_at
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', apiKey.id)

      return {
        id: apiKey.id,
        org_id: apiKey.org_id,
        scopes: (apiKey.scopes as string[]) || ['read'],
        rate_limit: apiKey.rate_limit,
      }
    }
  }

  return null
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `tm_live_${crypto.randomBytes(32).toString('hex')}`
  const prefix = key.slice(0, 8)
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  return { key, prefix, hash }
}

export async function logApiRequest(apiKeyId: string, method: string, path: string, statusCode: number, responseTimeMs: number, ip?: string) {
  const supabase = createAdminClient()
  await supabase.from('api_logs').insert({
    api_key_id: apiKeyId,
    method,
    path,
    status_code: statusCode,
    response_time_ms: responseTimeMs,
    ip_address: ip || null,
  })
}

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export function hasScope(scopes: string[], required: string): boolean {
  return scopes.includes(required) || scopes.includes('write')
}
