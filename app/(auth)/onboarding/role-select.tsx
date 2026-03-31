'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Users, Guitar, Wrench, MapPin, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const userTypes = [
  {
    id: 'artist',
    label: 'Artist',
    description: 'I manage my own touring — schedule, finances, merch, fans.',
    icon: Music,
    createsOrg: true,
  },
  {
    id: 'tour_manager',
    label: 'Tour Manager',
    description: 'I manage tours for artists — advance sheets, itineraries, budgets, team.',
    icon: Users,
    createsOrg: true,
  },
  {
    id: 'band_member',
    label: 'Band Member',
    description: 'I\'m in a band — I need my daily schedule, finances, setlists, and wellness.',
    icon: Guitar,
    createsOrg: true,
  },
  {
    id: 'crew',
    label: 'Crew',
    description: 'I do production, sound, lights, or stage management for tours.',
    icon: Wrench,
    createsOrg: false,
  },
  {
    id: 'venue_contact',
    label: 'Venue Contact',
    description: 'I work at a venue and fill out advance sheets for incoming artists.',
    icon: MapPin,
    createsOrg: false,
  },
  {
    id: 'fan',
    label: 'Fan',
    description: 'I want exclusive content, merch, and community access.',
    icon: Heart,
    createsOrg: false,
  },
]

export function RoleSelect({ userId }: { userId: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleContinue() {
    if (!selected) return
    setLoading(true)

    const supabase = createClient()
    await supabase
      .from('user_profiles')
      .update({ user_type: selected })
      .eq('id', userId)

    const role = userTypes.find((r) => r.id === selected)
    if (role?.createsOrg) {
      router.push('/modules')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {userTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelected(type.id)}
            className={`flex flex-col items-start rounded-xl border-2 p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              selected === type.id
                ? 'border-primary-500 bg-primary-500/5 shadow-sm'
                : 'border-border-default bg-surface-raised hover:border-primary-500/30'
            }`}
            aria-pressed={selected === type.id}
          >
            <type.icon className={`mb-3 h-7 w-7 ${selected === type.id ? 'text-primary-600 dark:text-primary-400' : 'text-text-muted'}`} aria-hidden="true" />
            <h2 className="text-sm font-semibold">{type.label}</h2>
            <p className="mt-1 text-xs text-text-secondary">{type.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected || loading}
          className="inline-flex items-center rounded-lg bg-primary-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
        >
          {loading ? 'Setting up...' : 'Continue'}
        </button>
        <p className="mt-3 text-xs text-text-muted">You can change this later in Settings.</p>
      </div>
    </div>
  )
}
