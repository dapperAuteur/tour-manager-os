import Link from 'next/link'
import { Search } from 'lucide-react'

export default function AuthNotFound() {
  return (
    <main id="main-content" className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center">
      <Search className="mb-4 h-12 w-12 text-text-muted" aria-hidden="true" />
      <h1 className="mb-2 text-3xl font-bold">404</h1>
      <p className="mb-6 text-text-secondary">This page doesn&apos;t exist or you don&apos;t have access.</p>
      <Link
        href="/dashboard"
        className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
      >
        Back to Dashboard
      </Link>
    </main>
  )
}
