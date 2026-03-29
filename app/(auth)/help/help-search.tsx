'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export function HelpSearch({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery || '')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/help?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/help')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto max-w-lg">
      <label htmlFor="help-search" className="sr-only">Search help articles</label>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
      <input
        id="help-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-border-default bg-surface-raised py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        placeholder="Search help articles..."
      />
    </form>
  )
}
