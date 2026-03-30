import Link from 'next/link'
import { Music } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
            aria-label="Tour Manager OS home"
          >
            <Music className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <span className="text-lg font-semibold">Tour Manager OS</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-4 sm:flex">
            <Link href="/roadmap" className="text-sm text-text-secondary hover:text-text-primary">Roadmap</Link>
            <Link href="/login?demo=true" className="text-sm text-text-secondary hover:text-text-primary">Demo</Link>
          </nav>
        </div>

        <nav aria-label="Header actions" className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-text-secondary hover:text-text-primary sm:inline-block"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700 sm:inline-block"
          >
            Sign Up
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
