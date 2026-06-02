/**
 * Browser-side helpers for registering the service worker, requesting
 * notification permission, and managing a web-push subscription.
 *
 * Returns null / throws helpful messages instead of generic errors so
 * the UI can guide users through permission flows.
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null
  const existing = await navigator.serviceWorker.getRegistration('/sw.js')
  if (existing) return existing
  return navigator.serviceWorker.register('/sw.js', { scope: '/' })
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  const reg = await ensureServiceWorker()
  if (!reg) return null
  return reg.pushManager.getSubscription()
}

export async function subscribeToPush(
  vapidPublicKey: string,
): Promise<PushSubscription | null> {
  if (!pushSupported()) {
    throw new Error('This browser doesn’t support web push notifications.')
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notification permission was denied. Re-enable it in your browser settings.'
        : 'Notification permission dismissed.',
    )
  }
  const reg = await ensureServiceWorker()
  if (!reg) return null
  const keyBytes = urlBase64ToUint8Array(vapidPublicKey)
  // Copy into a fresh ArrayBuffer so TypeScript's BufferSource type
  // resolves to the non-shared variant (Uint8Array<ArrayBufferLike>
  // would otherwise tag onto SharedArrayBuffer).
  const applicationServerKey = new Uint8Array(keyBytes.length)
  applicationServerKey.set(keyBytes)
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey.buffer,
  })

  const payload = sub.toJSON()
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: payload.endpoint,
      keys: payload.keys,
      user_agent: navigator.userAgent,
    }),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(
      json.error || 'Failed to register the subscription with the server.',
    )
  }
  return sub
}

export async function unsubscribeFromPush(): Promise<void> {
  const sub = await getExistingSubscription()
  if (!sub) return
  const endpoint = sub.endpoint
  await sub.unsubscribe().catch(() => undefined)
  await fetch(
    `/api/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`,
    { method: 'DELETE' },
  )
}
