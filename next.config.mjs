import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  env: {
    // Map Vercel Supabase integration vars to the NEXT_PUBLIC_ names our code expects.
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  },
}

// Wrap with the Sentry build plugin (error monitoring is ingested by Better Stack). Safe with no
// Sentry env set: without SENTRY_AUTH_TOKEN it simply skips source-map upload, so you get minified
// stack traces instead of a failed build, and the runtime SDK stays inert without a DSN.
// org/project/authToken all come from env, so nothing secret is committed here.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Kept for parity with the rest of the WitUS apps, which share this config block. NOTE: SDK v10
  // prints a deprecation warning for this and wants `webpack.treeshake.removeDebugLogging`
  // instead. Change it ecosystem-wide in one pass rather than letting the repos drift.
  disableLogger: true,
})
