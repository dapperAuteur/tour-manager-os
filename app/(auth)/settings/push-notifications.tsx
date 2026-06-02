'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, Send } from 'lucide-react'
import {
  getExistingSubscription,
  pushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push/client'

export function PushNotifications({
  vapidPublicKey,
}: {
  vapidPublicKey: string | null
}) {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ok = pushSupported()
    setSupported(ok)
    if (!ok) return
    setPermission(Notification.permission)
    getExistingSubscription()
      .then((sub) => setSubscribed(!!sub))
      .catch(() => undefined)
  }, [])

  async function turnOn() {
    setError(null)
    setInfo(null)
    if (!vapidPublicKey) {
      setError(
        'Push not configured — NEXT_PUBLIC_VAPID_PUBLIC_KEY is unset on the server.',
      )
      return
    }
    setBusy(true)
    try {
      await subscribeToPush(vapidPublicKey)
      setPermission(Notification.permission)
      setSubscribed(true)
      setInfo('Push notifications enabled on this device.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable push.')
    } finally {
      setBusy(false)
    }
  }

  async function turnOff() {
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      await unsubscribeFromPush()
      setSubscribed(false)
      setInfo('Push notifications disabled on this device.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable push.')
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      const res = await fetch('/api/push/test', { method: 'POST' })
      const json = (await res.json()) as {
        sent?: number
        pruned?: number
        failed?: number
        error?: string
      }
      if (!res.ok) {
        setError(json.error || 'Test push failed.')
        return
      }
      const sent = json.sent ?? 0
      const pruned = json.pruned ?? 0
      const failed = json.failed ?? 0
      if (sent > 0) {
        setInfo(`Test push sent to ${sent} device${sent === 1 ? '' : 's'}.`)
        return
      }
      if (pruned > 0 || failed > 0) {
        setError(
          `Push rejected by ${pruned + failed} device${pruned + failed === 1 ? '' : 's'} (${pruned} expired, ${failed} failed). ` +
            'Click **Turn off**, then **Turn on push** again — your browser subscription likely predates the current VAPID keys and needs to be re-issued.',
        )
        if (pruned > 0) {
          // Server already deleted the row; reflect that here.
          setSubscribed(false)
        }
        return
      }
      setError(
        'No devices registered for your account on this server. Click Turn on push to subscribe this browser.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test push failed.')
    } finally {
      setBusy(false)
    }
  }

  async function reSubscribe() {
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      await unsubscribeFromPush()
      setSubscribed(false)
      if (!vapidPublicKey) {
        setError('Push not configured — NEXT_PUBLIC_VAPID_PUBLIC_KEY is unset.')
        return
      }
      await subscribeToPush(vapidPublicKey)
      setSubscribed(true)
      setInfo('Subscription re-issued with the current VAPID key.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Re-subscribe failed.')
    } finally {
      setBusy(false)
    }
  }

  if (!supported) {
    return (
      <div className="rounded-md border border-border-default bg-surface p-3 text-sm text-text-secondary">
        Your browser doesn&apos;t support web push notifications. Try a desktop
        Chrome, Edge, or Firefox build, or use the iOS app once
        installed via Add to Home Screen.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          {subscribed ? (
            <Bell className="mt-0.5 size-5 text-primary-600 dark:text-primary-400" aria-hidden />
          ) : (
            <BellOff className="mt-0.5 size-5 text-text-muted" aria-hidden />
          )}
          <div>
            <p className="font-medium">
              {subscribed
                ? 'On — this device will receive schedule alerts'
                : 'Off — turn on to get schedule changes and family-hub updates'}
            </p>
            <p className="text-xs text-text-muted">
              Each browser / device is registered separately. We notify when an
              advance sheet lands, a show time shifts, or a family poll is
              closing.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {subscribed ? (
            <>
              <button
                type="button"
                onClick={sendTest}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-1.5 text-xs hover:bg-surface-alt disabled:opacity-50"
              >
                <Send className="size-3" aria-hidden /> Send test
              </button>
              <button
                type="button"
                onClick={reSubscribe}
                disabled={busy}
                title="Re-issue the subscription with the current VAPID key"
                className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-1.5 text-xs hover:bg-surface-alt disabled:opacity-50"
              >
                Re-subscribe
              </button>
              <button
                type="button"
                onClick={turnOff}
                disabled={busy}
                className="rounded-md border border-error-500/40 px-3 py-1.5 text-xs font-medium text-error-700 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
              >
                Turn off
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={turnOn}
              disabled={busy}
              className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {busy ? 'Enabling…' : 'Turn on push'}
            </button>
          )}
        </div>
      </div>

      {permission === 'denied' && (
        <p className="text-xs text-warning-700 dark:text-warning-400">
          Notification permission is blocked at the browser level. Click the
          padlock in the address bar and allow notifications, then try again.
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
      {info && (
        <p role="status" className="text-xs text-success-700 dark:text-success-400">
          {info}
        </p>
      )}
    </div>
  )
}
