import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Tenant {
  domain: string
  org_id: string
  org_slug: string
  org_name: string
  brand_primary_color: string | null
  white_label_enabled: boolean
  /** Landing path served when the fan hits the bare domain root. */
  landing_path: string
}

/** Hosts the platform always serves directly — never rewrite for these. */
const PLATFORM_HOSTS = new Set([
  'tour.witus.online',
  'www.tour.witus.online',
  'localhost:3000',
  'localhost',
])

interface CacheEntry {
  expires_at: number
  tenant: Tenant | null
}

const HOST_CACHE = new Map<string, CacheEntry>()
const HOST_CACHE_TTL_MS = 60_000

export function isPlatformHost(host: string | null): boolean {
  if (!host) return true
  const lower = host.toLowerCase()
  return PLATFORM_HOSTS.has(lower) || lower.endsWith('.vercel.app')
}

/**
 * Looks up the verified custom-domain row for `host` and returns the
 * tenant context. Cached in-process for HOST_CACHE_TTL_MS so the
 * middleware hot path doesn't hit Supabase on every request from the
 * same domain. Null result means: serve the platform default.
 */
export async function resolveTenantFromHost(
  host: string | null,
): Promise<Tenant | null> {
  if (!host || isPlatformHost(host)) return null
  const key = host.toLowerCase()
  const cached = HOST_CACHE.get(key)
  if (cached && cached.expires_at > Date.now()) return cached.tenant

  const admin = createAdminClient()
  const { data: domain } = await admin
    .from('custom_domains')
    .select(
      `domain, verified, org_id,
       organizations:org_id(slug, name, brand_primary_color, white_label_enabled)`,
    )
    .eq('domain', key)
    .eq('verified', true)
    .maybeSingle()

  let tenant: Tenant | null = null
  if (domain) {
    const org = domain.organizations as unknown as {
      slug: string
      name: string
      brand_primary_color: string | null
      white_label_enabled: boolean | null
    } | null
    if (org?.slug) {
      tenant = {
        domain: domain.domain,
        org_id: domain.org_id,
        org_slug: org.slug,
        org_name: org.name,
        brand_primary_color: org.brand_primary_color ?? null,
        white_label_enabled: !!org.white_label_enabled,
        landing_path: `/store/${org.slug}`,
      }
    }
  }

  HOST_CACHE.set(key, {
    expires_at: Date.now() + HOST_CACHE_TTL_MS,
    tenant,
  })
  return tenant
}

/**
 * Reads the `x-tmos-tenant-slug` header set by middleware and looks up
 * the full tenant record. Server components and route handlers use
 * this to discover their custom-domain context without re-hitting the
 * resolver per render.
 */
export async function currentTenant(): Promise<Tenant | null> {
  const h = await headers()
  const host = h.get('x-tmos-tenant-host')
  if (!host) return null
  return resolveTenantFromHost(host)
}
