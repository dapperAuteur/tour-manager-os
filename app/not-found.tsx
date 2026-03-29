import Link from 'next/link'
import { Music } from 'lucide-react'
import { Header } from '@/components/layout/header'

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900">
          <Music className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <p className="mb-6 text-lg text-text-secondary">Page not found. This page doesn&apos;t exist or has been moved.</p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            Go Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg border border-border-default px-6 py-3 text-sm font-medium hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
          >
            Log In
          </Link>
        </div>
      </main>
    </>
  )
}
