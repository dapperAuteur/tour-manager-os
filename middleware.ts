import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  isPlatformHost,
  resolveTenantFromHost,
} from '@/lib/multi-tenant/resolver'
import { requiresAuth } from '@/lib/auth/public-paths'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Allow app to load without Supabase configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  // Multi-tenant routing: when a request arrives on a verified custom
  // domain, rewrite the bare root to the org's storefront and tag the
  // request so downstream server components can recover the tenant
  // context via lib/multi-tenant/resolver currentTenant().
  const requestHost = request.headers.get('host')
  if (!isPlatformHost(requestHost)) {
    const tenant = await resolveTenantFromHost(requestHost).catch(() => null)
    if (tenant) {
      if (request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = tenant.landing_path
        const rewritten = NextResponse.rewrite(url)
        rewritten.headers.set('x-tmos-tenant-host', tenant.domain)
        rewritten.headers.set('x-tmos-tenant-org', tenant.org_slug)
        return rewritten
      }
      const passthrough = NextResponse.next({ request })
      passthrough.headers.set('x-tmos-tenant-host', tenant.domain)
      passthrough.headers.set('x-tmos-tenant-org', tenant.org_slug)
      return passthrough
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Which paths a signed-out visitor may reach lives in lib/auth/public-paths so it is unit
  // testable. Until this branch the list here held '/' and was matched with startsWith, so every
  // path counted as public and the redirect below was unreachable code.
  if (!user && requiresAuth(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// `api/health` is excluded on purpose. The uptime probe must answer the same way on every
// hostname, and everything above this line is host-dependent: custom-domain tenant resolution
// runs a Supabase lookup and the auth gate reads cookies. Routing the monitor through either
// would let an unrecognised white-label host, or a tenant-lookup hiccup, make a perfectly
// healthy app read as down. The route is public and returns no data, so it needs no gate.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health$|ingest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
