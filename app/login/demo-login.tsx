'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Music, Wrench, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const demoRoles = [
  {
    id: 'manager',
    label: 'Tour Manager',
    description: 'Full admin — tours, finances, team, all modules',
    icon: Users,
  },
  {
    id: 'member',
    label: 'Band Member',
    description: 'Schedule, finances, merch, community',
    icon: Music,
  },
  {
    id: 'crew',
    label: 'Crew Member',
    description: 'Production info, schedules, documents',
    icon: Wrench,
  },
  {
    id: 'readonly',
    label: 'Free User',
    description: 'Read-only — see what unpaid access looks like',
    icon: Eye,
  },
]

export function DemoLogin() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleDemoLogin(roleId: string) {
    setError('')
    setLoading(roleId)

    try {
      // Create demo user via API
      const res = await fetch('/api/demo/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create demo session')
        setLoading(null)
        return
      }

      // Sign in with the demo credentials
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(null)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold">Try the Demo</h2>
        <p className="text-sm text-text-secondary">
          Choose a role to explore — full CRUD access, resets at midnight.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {demoRoles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => handleDemoLogin(role.id)}
            disabled={loading !== null}
            className="flex items-start gap-3 rounded-xl border border-border-default bg-surface-raised p-4 text-left transition-all hover:border-primary-500/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
              <role.icon className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {loading === role.id ? 'Loading...' : role.label}
              </p>
              <p className="text-xs text-text-muted">{role.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
