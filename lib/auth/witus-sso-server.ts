// Server-side reads of the WitUS client env. Never import this from a 'use client' module; client
// components receive the resolved WitusSsoConfig as props from a server component. (No
// `import 'server-only'`: the package is not a dependency of this repo. The secret is only read
// inside route handlers, and a client bundle would see `undefined` for it, not the value.)
//
// Env (all server-only except NEXT_PUBLIC_SITE_URL):
//   WITUS_OIDC_CLIENT_ID      `witus-tour`. Unset = every WitUS affordance stays dark.
//   WITUS_OIDC_CLIENT_SECRET  the shared secret; the IdP holds the same value as
//                             WITUS_OIDC_SECRET__TOUR.
//   WITUS_OIDC_AUTHORIZE_URL / WITUS_OIDC_TOKEN_URL / WITUS_OIDC_USERINFO_URL
//                             optional overrides; the fallbacks in ./witus-sso.ts match discovery.
//   NEXT_PUBLIC_SITE_URL      the origin the callback returns to; falls back to
//                             https://tour.witus.online (see TOUR_SITE_URL_FALLBACK).

import {
  TOUR_SITE_URL_FALLBACK,
  WITUS_OIDC_AUTHORIZE_FALLBACK,
  WITUS_OIDC_TOKEN_FALLBACK,
  WITUS_OIDC_USERINFO_FALLBACK,
  normalizeOrigin,
  witusSsoConfigFor,
  type WitusSsoConfig,
} from './witus-sso'

export function witusEndpoints() {
  return {
    authorizeUrl: process.env.WITUS_OIDC_AUTHORIZE_URL || WITUS_OIDC_AUTHORIZE_FALLBACK,
    tokenUrl: process.env.WITUS_OIDC_TOKEN_URL || WITUS_OIDC_TOKEN_FALLBACK,
    userinfoUrl: process.env.WITUS_OIDC_USERINFO_URL || WITUS_OIDC_USERINFO_FALLBACK,
  }
}

/** The origin the IdP returns to. Always the configured one, never the request origin. */
export function witusSiteOrigin(): string {
  return normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ?? TOUR_SITE_URL_FALLBACK
}

export function witusClientCredentials() {
  return {
    clientId: process.env.WITUS_OIDC_CLIENT_ID ?? '',
    clientSecret: process.env.WITUS_OIDC_CLIENT_SECRET ?? '',
  }
}

/** The WitUS config for a request that arrived with this Host header. */
export function resolveWitusSsoConfig(requestHost: string | null | undefined): WitusSsoConfig {
  return witusSsoConfigFor({
    clientId: process.env.WITUS_OIDC_CLIENT_ID,
    authorizeUrl: witusEndpoints().authorizeUrl,
    siteUrl: witusSiteOrigin(),
    requestHost,
  })
}
