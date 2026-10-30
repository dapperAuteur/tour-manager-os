'use client'

// "Sign in with WitUS" on /login, plus the page's one silent sign-in attempt.
// Ported from CentenarianOS components/login/WitusSsoButton.tsx (origin/main c904189).
//
// SILENT SIGN-IN. Once per browser session a signed-out visitor is sent through
// /api/auth/witus/authorize?prompt=none as a TOP-LEVEL navigation, so the browser carries the IdP's
// SameSite=Lax session cookie. With a live WitUS session the visitor comes back signed in; without
// one the callback returns them here with no message. Decision and loop guard:
// lib/auth/witus-sso.ts (silentSsoDecision).
//
// THE GATE. `enabled` is resolved on the SERVER (lib/auth/witus-sso-server.ts) from
// WITUS_OIDC_CLIENT_ID and the request host, and passed in as a prop. Disabled renders no button
// and never redirects; only a witus_* error message can still show.
//
// Render it on /login only, and not in the demo picker: the silent attempt navigates away.

import { useEffect } from 'react'
import {
  LOGIN_NEXT_PARAM,
  hasSilentSsoFlag,
  silentSsoDecision,
  silentSsoFlagCookie,
  witusAuthorizePath,
  witusErrorMessage,
} from '@/lib/auth/witus-sso'

export function WitusSignIn({
  enabled,
  error,
  next,
}: {
  /** Server-resolved: configured WitUS client on the registered host. */
  enabled: boolean
  /** The page's `?error=` value, if any. Only witus_* codes render a message. */
  error?: string | null
  /** The page's `?redirect=` value, if any. Validated again before use. */
  next?: string | null
}) {
  useEffect(() => {
    const decision = silentSsoDecision({
      enabled,
      search: window.location.search,
      attempted: readAttempted(),
    })
    if (!decision.attempt) return

    // THE LOOP GUARD, written BEFORE leaving, never after the return: a flag written on return is
    // a flag that never exists when the return is the thing that failed. The callback's
    // `?sso=tried` marker covers a browser that refuses the cookie.
    writeAttempted()
    const from = new URLSearchParams(window.location.search).get(LOGIN_NEXT_PARAM)
    // replace(), not assign(): Back from the dashboard must not land on a page that redirects again.
    window.location.replace(witusAuthorizePath(from, true))
  }, [enabled])

  const message = witusErrorMessage(error)

  if (!enabled && !message) return null

  return (
    <div className="mt-4 flex flex-col gap-3">
      {message && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {message}
        </div>
      )}
      {enabled && (
        <>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default" />
            </div>
            <span className="relative bg-surface-raised px-3 text-xs text-text-muted">or</span>
          </div>
          <a
            href={witusAuthorizePath(next)}
            // Also records the attempt, so a visitor who comes back from the IdP's login page (or
            // presses Back) is not then sent on a silent round trip as well.
            onClick={writeAttempted}
            className="flex min-h-11 items-center justify-center rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-surface transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            Sign in with WitUS
          </a>
          <p className="text-center text-xs text-text-secondary">
            One account for every WitUS app. Uses the same email as your Tour Manager OS account.
          </p>
        </>
      )}
    </div>
  )
}

/** Cookie access can throw in sandboxed frames; a failure reads as "not attempted". */
function readAttempted(): boolean {
  try {
    return hasSilentSsoFlag(document.cookie)
  } catch {
    return false
  }
}

function writeAttempted(): void {
  try {
    document.cookie = silentSsoFlagCookie(window.location.protocol === 'https:')
  } catch {
    // No cookie, no flag. The `?sso=tried` marker on every bounce back still applies.
  }
}
