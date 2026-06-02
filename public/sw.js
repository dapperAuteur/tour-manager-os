/* Tour Manager OS — push notification service worker.
   Receives push events, shows the notification, and routes clicks
   to the URL embedded in the payload.

   Lifecycle: register at the auth-layout level via lib/push/client.ts.
   No fetch interception (no offline caching here) — this SW exists
   purely for push.
*/

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Tour Manager OS',
    body: 'You have a new update.',
    url: '/today',
  }
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() }
    }
  } catch (e) {
    // Non-JSON payload — keep defaults but surface the raw text
    payload.body = event.data ? event.data.text() : payload.body
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: { url: payload.url },
      tag: payload.topic || 'tour-manager-os',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/today'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus()
          }
        }
        return self.clients.openWindow(targetUrl)
      }),
  )
})
