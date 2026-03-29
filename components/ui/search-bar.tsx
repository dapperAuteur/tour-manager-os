'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  basePath: string
  placeholder?: string
  initialQuery?: string
}

export function SearchBar({ basePath, placeholder = 'Search...', initialQuery }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery || '')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`${basePath}?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push(basePath)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative mb-6">
      <label htmlFor="search-input" className="sr-only">Search</label>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
      <input
        id="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-border-default bg-surface-raised py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        placeholder={placeholder}
      />
    </form>
  )
}
