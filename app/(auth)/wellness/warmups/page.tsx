import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, Clock } from 'lucide-react'
import { getWarmupRoutines } from '@/lib/wellness/queries'

export const metadata: Metadata = { title: 'Warmup Routines', robots: { index: false } }

const typeColors: Record<string, string> = {
  vocal: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  physical: 'bg-success-500/20 text-success-600 dark:text-success-500',
  breathing: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  stretching: 'bg-error-500/20 text-error-500',
  combined: 'bg-text-muted/20 text-text-muted',
}

export default async function WarmupsPage() {
  const routines = await getWarmupRoutines()

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/wellness" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Wellness</Link>

      <h1 className="mb-2 text-2xl font-bold">Warmup Routines</h1>
      <p className="mb-8 text-sm text-text-secondary">Pre-show vocal and physical warmups designed for touring musicians.</p>

      <div className="space-y-4">
        {routines.map((routine) => {
          const steps = Array.isArray(routine.steps) ? routine.steps as { title: string; description: string; duration_seconds: number }[] : []
          return (
            <div key={routine.id} className="rounded-xl border border-border-default bg-surface-raised p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    <h2 className="text-lg font-semibold">{routine.title}</h2>
                  </div>
                  {routine.description && <p className="mt-1 text-sm text-text-secondary">{routine.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[routine.routine_type]}`}>{routine.routine_type}</span>
                  {routine.duration_minutes && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="h-3 w-3" aria-hidden="true" /> {routine.duration_minutes} min
                    </span>
                  )}
                </div>
              </div>

              {steps.length > 0 && (
                <ol className="space-y-3">
                  {steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 rounded-lg bg-surface-alt p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">{idx + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-text-secondary">{step.description}</p>
                      </div>
                      {step.duration_seconds && (
                        <span className="shrink-0 text-xs text-text-muted">{Math.round(step.duration_seconds / 60)}:{(step.duration_seconds % 60).toString().padStart(2, '0')}</span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
