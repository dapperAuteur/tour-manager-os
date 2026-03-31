/**
 * Standard analytics events for Tour Manager OS.
 * Use these constants to keep event names consistent.
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
} as const
