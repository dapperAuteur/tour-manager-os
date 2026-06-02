'use client'

import { useState } from 'react'
import { Mail, Unplug } from 'lucide-react'

export function GmailConnection({
  connected,
  emailAddress,
  configured,
  flash,
}: {
  connected: boolean
  emailAddress: string | null
  configured: boolean
  flash: string | null
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function disconnect() {
    if (!window.confirm('Forget the Gmail connection for this account?')) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/oauth/gmail/disconnect', { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error || 'Disconnect failed')
        return
      }
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnect failed')
    } finally {
      setBusy(false)
    }
  }

  if (!configured) {
    return (
      <div className="rounded-md border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-700 dark:text-warning-300">
        Gmail OAuth isn&apos;t configured on this server yet. Ask the platform
        admin to set <code className="font-mono">GOOGLE_OAUTH_CLIENT_ID</code>,
        <code className="font-mono"> GOOGLE_OAUTH_CLIENT_SECRET</code>, and
        <code className="font-mono"> GOOGLE_OAUTH_REDIRECT_URI</code> — see
        the &ldquo;Connecting your Gmail&rdquo; help article for the exact
        steps you can walk them through yourself.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {flash && (
        <p
          className={`text-xs ${
            flash === 'connected'
              ? 'text-success-700 dark:text-success-300'
              : 'text-warning-700 dark:text-warning-400'
          }`}
        >
          {flash === 'connected' && 'Gmail connected — campaigns will send from your address.'}
          {flash === 'cancelled' && 'Gmail consent cancelled.'}
          {flash === 'state_mismatch' && 'OAuth state mismatch — try again from this page.'}
          {flash === 'no_refresh_token' && 'Google did not return a refresh token. Revoke at myaccount.google.com/permissions and re-connect.'}
          {flash === 'no_email' && 'Could not read your Google email — re-grant the userinfo scope.'}
          {flash === 'failed' && 'Gmail connection failed. Check the help article and try again.'}
          {flash === 'unconfigured' && 'Gmail OAuth not configured on the server.'}
          {flash === 'signed_out' && 'You were signed out during the OAuth round-trip. Sign in and try again.'}
          {flash === 'invalid_response' && 'Google returned an invalid OAuth response.'}
        </p>
      )}

      {connected ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 text-primary-600 dark:text-primary-400" aria-hidden />
            <div>
              <p className="font-medium">
                Connected as <span className="font-mono">{emailAddress}</span>
              </p>
              <p className="text-xs text-text-muted">
                Email campaigns you create now send via your Gmail account.
                Outbound shows in your Sent folder; replies land in your
                inbox.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={disconnect}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md border border-error-500/40 px-3 py-1.5 text-xs font-medium text-error-700 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
          >
            <Unplug className="size-3" aria-hidden /> Disconnect
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 text-text-muted" aria-hidden />
            <div>
              <p className="font-medium">Not connected</p>
              <p className="text-xs text-text-muted">
                Connect Gmail so emails send from your address. Fans see
                your name, replies route to your inbox, and outbound shows
                in your Sent folder. Until you connect, campaigns send via
                the platform&apos;s shared Mailgun address.
              </p>
            </div>
          </div>
          <a
            href="/api/oauth/gmail/init"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
          >
            Connect Gmail
          </a>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
    </div>
  )
}
