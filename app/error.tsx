'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'

// Root route error boundary. Error pages keep the app shell (witus docs/shared-ui-ux-dx.md): the
// root layout renders no header, so this renders Header (with its sign-in link) and SiteFooter,
// like not-found.tsx. No error text is shown; the digest is an opaque id the logs carry.
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-2 text-3xl font-bold">Something went wrong</h1>
        <p role="alert" className="mb-6 text-lg text-text-secondary">
          This page hit an unexpected error. Try again, or head back home.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg border border-border-default px-6 py-3 text-sm font-medium hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            Go Home
          </Link>
        </div>
        {error.digest ? <p className="mt-6 text-xs text-text-secondary">Reference: {error.digest}</p> : null}
      </main>
      <SiteFooter />
    </>
  )
}
