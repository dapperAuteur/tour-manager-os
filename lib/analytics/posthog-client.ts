import posthog from 'posthog-js'

let initialized = false

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

  if (!key) return

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage',
    // Privacy-friendly defaults
    disable_session_recording: false,
    mask_all_text: false,
    mask_all_element_attributes: false,
  })

  initialized = true
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.identify(userId, properties)
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.capture(event, properties)
}

export function resetUser() {
  if (typeof window === 'undefined') return
  posthog.reset()
}

export { posthog }
