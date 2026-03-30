import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Moon, Zap, Smile, Mic, Dumbbell, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWellnessLog, getWellnessHistory } from '@/lib/wellness/queries'
import { RiseWellnessCard } from '@/components/ui/rise-wellness-card'
import { DailyLogForm } from './daily-log-form'

export const metadata: Metadata = { title: 'Wellness', robots: { index: false } }

function Stat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number | null | undefined; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-raised p-3">
      <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-semibold">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export default async function WellnessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const todayLog = await getWellnessLog(user.id, today)
  const history = await getWellnessHistory(user.id, 7)

  // Calculate averages
  const avg = (field: string) => {
    const vals = history.filter((h) => (h as Record<string, unknown>)[field] != null).map((h) => Number((h as Record<string, unknown>)[field]))
    return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Heart className="h-6 w-6 text-error-500" aria-hidden="true" />
          Wellness
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Track your wellbeing on the road. Small habits, big impact.</p>
      </div>

      {/* Quick links */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/wellness/warmups" className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt">Warmup Routines</Link>
        <Link href="/wellness/checkins" className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt">Family Check-ins</Link>
        <Link href="/wellness-resources" className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt">Exercise Library</Link>
      </div>

      {/* 7-day averages */}
      {history.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">7-Day Averages</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Moon} label="Sleep" value={avg('sleep_hours') ? `${avg('sleep_hours')} hrs` : null} color="text-primary-600 dark:text-primary-400" />
            <Stat icon={Zap} label="Energy" value={avg('energy_level') ? `${avg('energy_level')}/5` : null} color="text-warning-600 dark:text-warning-500" />
            <Stat icon={Smile} label="Mood" value={avg('mood') ? `${avg('mood')}/5` : null} color="text-success-600 dark:text-success-500" />
            <Stat icon={Mic} label="Voice" value={avg('voice_condition') ? `${avg('voice_condition')}/5` : null} color="text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Daily log */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Today&apos;s Log</h2>
          <div className="rounded-xl border border-border-default bg-surface-raised p-6">
            <DailyLogForm existing={todayLog} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RiseWellnessCard />

          <div className="rounded-xl border border-border-default bg-surface-raised p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Dumbbell className="h-4 w-4 text-text-muted" aria-hidden="true" />
              Exercise Library
            </h3>
            <p className="mb-3 text-sm text-text-secondary">
              Free exercises with step-by-step instructions, muscle diagrams, and video guides — powered by CentenarianOS.
            </p>
            <a
              href="https://centenarianos.com/exercises"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary-600 hover:underline dark:text-primary-400"
            >
              Browse exercises &rarr;
            </a>
          </div>

          <div className="rounded-xl border border-border-default bg-surface-raised p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-text-muted" aria-hidden="true" />
              Family Check-ins
            </h3>
            <p className="mb-3 text-sm text-text-secondary">How is everyone feeling about the tour?</p>
            <Link href="/wellness/checkins" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
              View check-ins &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
