'use client'

// "Sign out of WitUS everywhere": the second, secondary sign-out control under the plain
// "Sign out" in the app sidebar (BAM, 2026-10-29, witus task 128 option (b)). "Sign out" ends only
// Tour's Supabase session; this one ends it AND the shared WitUS session at the IdP. Other WitUS
// apps keep their own sessions, which the help text says. Same shape as Work.WitUS
// (contractor-os components/nav/SignOutEverywhereButton.tsx) and WitUS Inbox.
//
// Renders nothing unless `logoutUrl` is set. The URL is resolved on the SERVER
// (lib/auth/witus-sso-server.ts) and is null unless this app is a configured WitUS client and the
// request is on the registered host, so white-label custom domains never show it.

import { useId, useState } from 'react'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  SIGNING_OUT_LABEL,
  SIGN_OUT_EVERYWHERE_HELP,
  SIGN_OUT_EVERYWHERE_LABEL,
  signOutEverywhere,
} from '@/lib/auth/witus-sso'

export function SignOutEverywhereButton({ logoutUrl }: { logoutUrl: string | null }) {
  const helpId = useId()
  const [busy, setBusy] = useState(false)
  if (!logoutUrl) return null
  const url = logoutUrl

  function handleClick() {
    setBusy(true)
    // ORDER IS THE SAFETY PROPERTY: signOutEverywhere awaits the local Supabase sign-out BEFORE it
    // navigates to the IdP, so an unreachable or refusing IdP still leaves the person signed out
    // here. A full navigation, not router.push: this leaves our origin for the IdP, which then
    // returns to https://tour.witus.online/.
    void signOutEverywhere({
      signOutLocal: () => createClient().auth.signOut(),
      navigate: (target) => window.location.assign(target),
      logoutUrl: url,
    })
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-describedby={helpId}
        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        {busy ? SIGNING_OUT_LABEL : SIGN_OUT_EVERYWHERE_LABEL}
      </button>
      <p id={helpId} className="px-3 text-xs text-text-secondary">
        {SIGN_OUT_EVERYWHERE_HELP}
      </p>
    </div>
  )
}
