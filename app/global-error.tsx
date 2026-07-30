'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// Root error boundary. This catches errors thrown in the root layout itself, which is the one
// failure the per-route boundaries cannot cover. It replaces the root layout, so it renders its
// own <html>/<body> and cannot rely on globals.css or the theme provider. Hence the inline
// <style> block, which still honours the user's light/dark preference.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // No-op when no DSN is configured.
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <style>{`
          :root { color-scheme: light dark; --bg: #ffffff; --fg: #0f172a; --muted: #64748b; --line: #cbd5e1; --accent: #0f172a; --accent-fg: #ffffff; }
          @media (prefers-color-scheme: dark) {
            :root { --bg: #0f172a; --fg: #f8fafc; --muted: #94a3b8; --line: #334155; --accent: #f8fafc; --accent-fg: #0f172a; }
          }
          body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
                 background: var(--bg); color: var(--fg);
                 font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
          .tmos-shell { max-width: 30rem; padding: 1.5rem; text-align: center; }
          .tmos-h1 { font-size: 1.5rem; line-height: 1.3; font-weight: 700; margin: 0 0 0.75rem; }
          .tmos-p { color: var(--muted); margin: 0 0 1.25rem; }
          .tmos-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; }
          .tmos-btn { min-height: 44px; display: inline-flex; align-items: center; justify-content: center;
                      padding: 0 1.25rem; border-radius: 0.5rem; font: inherit; font-weight: 600;
                      cursor: pointer; text-decoration: none; }
          .tmos-btn:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
          .tmos-primary { background: var(--accent); color: var(--accent-fg); border: 1px solid var(--accent); }
          .tmos-secondary { background: transparent; color: inherit; border: 1px solid var(--line); }
          .tmos-ref { color: var(--muted); font-size: 0.75rem; margin: 1rem 0 0; }
        `}</style>
        <main id="main-content" className="tmos-shell">
          <h1 className="tmos-h1">Something went wrong</h1>
          <p className="tmos-p">
            We could not load this page. The error has been logged. Please try again, and if it
            keeps happening use the feedback tool once you are back in.
          </p>
          <div className="tmos-actions">
            <button type="button" onClick={reset} className="tmos-btn tmos-primary">
              Try again
            </button>
            {/* This boundary renders outside the router, so a plain anchor is correct here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="tmos-btn tmos-secondary">
              Back to home
            </a>
          </div>
          {error.digest ? <p className="tmos-ref">Reference: {error.digest}</p> : null}
        </main>
      </body>
    </html>
  )
}
