/**
 * Event taxonomy for Tour Manager OS.
 *
 * The ecosystem shares ONE PostHog project, separated by the `app` property that
 * posthog-provider registers on load. Two rules keep that project readable, and both
 * are cheap now and expensive to retrofit once data has landed:
 *
 *   1. `snake_case`, object first, verb in past tense — `tour_created`.
 *   2. NEVER put the app name in the event name. The `app` property already carries
 *      it; duplicating it makes the same action from two apps look like two events
 *      and kills the cross-app comparison that sharing a project exists to enable.
 *
 * Shared lifecycle events (the SHARED_EVENTS block) use identical names in every
 * ecosystem app, so "where do people fall out of sign-in" is answerable across all of
 * them at once. Do not rename these here without renaming them everywhere.
 *
 * See plans/26-posthog-ecosystem-rollout.md in the witus repo for the full contract.
 */

/** This app's slug. Every event carries it via register({ app }). */
export const ANALYTICS_APP = 'tour-manager-os'

/**
 * Events with identical names across every ecosystem app. Names are contractual.
 */
export const SHARED_EVENTS = {
  signinStarted: 'signin_started',
  signinSucceeded: 'signin_succeeded',
  signinFailed: 'signin_failed',
} as const

/**
 * Events specific to Tour Manager OS. Names predate the ecosystem standard and are
 * preserved so existing PostHog data stays continuous — do not rename without
 * accepting a series break in the shared project.
 */
export const EVENTS = {
  // Auth
  SIGNUP: 'user_signed_up',
  LOGIN: 'user_logged_in',
  LOGOUT: 'user_logged_out',
  ONBOARDING_ROLE_SELECTED: 'onboarding_role_selected',

  // Tours
  TOUR_CREATED: 'tour_created',
  SHOW_ADDED: 'show_added',
  ADVANCE_SHEET_SENT: 'advance_sheet_sent',
  ADVANCE_SHEET_SUBMITTED: 'advance_sheet_submitted',

  // Finances
  EXPENSE_ADDED: 'expense_added',
  REVENUE_RECORDED: 'revenue_recorded',
  CSV_EXPORTED: 'csv_exported',
  TAX_EXPORT: 'tax_export_downloaded',

  // Merch
  PRODUCT_ADDED: 'product_added',
  SALE_RECORDED: 'sale_recorded',

  // Marketing
  CAMPAIGN_SENT: 'campaign_sent',
  SUBSCRIBER_ADDED: 'subscriber_added',

  // Community
  POST_CREATED: 'post_created',
  POLL_CREATED: 'poll_created',
  POLL_VOTED: 'poll_voted',

  // Demo
  DEMO_LOGIN: 'demo_login',

  // Subscription
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_CREATED: 'subscription_created',

  // Feedback
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  BUG_REPORTED: 'bug_reported',

  // Module
  MODULE_ACTIVATED: 'module_activated',
  ORG_CREATED: 'org_created',

  /** An explicit route view. capture_pageview is off — Next's client router would
   *  fire it once and then lie — so route changes are reported deliberately. */
  routeViewed: 'route_viewed',
  ...SHARED_EVENTS,
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]
