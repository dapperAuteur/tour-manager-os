import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Heart, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { assessBurnoutFor } from '@/lib/wellness/burnout'
import { RiseWellnessCallout } from '@/components/wellness/rise-wellness-callout'

export const metadata: Metadata = {
  title: 'Burnout Risk',
  robots: { index: false },
}

const LEVEL_COPY: Record<
  'low' | 'elevated' | 'high',
  { label: string; color: string; ring: string }
> = {
  low: {
    label: 'Low risk',
    color: 'text-success-700 dark:text-success-300',
    ring: 'ring-success-500/40 bg-success-500/10',
  },
  elevated: {
    label: 'Elevated risk',
    color: 'text-warning-700 dark:text-warning-300',
    ring: 'ring-warning-500/40 bg-warning-500/10',
  },
  high: {
    label: 'High risk — act soon',
    color: 'text-error-700 dark:text-error-300',
    ring: 'ring-error-500/40 bg-error-500/10',
  },
}

export default async function BurnoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const assessment = await assessBurnoutFor(user.id)
  const meta = LEVEL_COPY[assessment.level]

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/wellness"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Back to wellness
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Heart className="size-5 text-error-500" aria-hidden /> Burnout Risk
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          A {assessment.windowDays}-day read on your wellness logs combined with
          schedule density. This is a conversation starter, not a diagnosis —
          pair it with the days-off planner so a flag turns into an action.
        </p>
      </header>

      <section
        aria-labelledby="risk-level"
        className={`mb-6 rounded-2xl p-6 ring-1 ${meta.ring}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="risk-level"
              className={`text-lg font-semibold ${meta.color}`}
            >
              {meta.label}
            </h2>
            <p className="text-xs text-text-muted">
              Score {assessment.score}/100 · {assessment.logsAnalyzed} logs ·{' '}
              {assessment.showsInWindow} shows in window
            </p>
          </div>
          {assessment.level === 'high' ? (
            <AlertTriangle className="size-7 text-error-500" aria-hidden />
          ) : assessment.level === 'elevated' ? (
            <AlertTriangle className="size-7 text-warning-500" aria-hidden />
          ) : (
            <ShieldCheck className="size-7 text-success-500" aria-hidden />
          )}
        </div>
      </section>

      <section aria-labelledby="signals" className="mb-6">
        <h2 id="signals" className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Contributing signals
        </h2>
        {assessment.signals.length === 0 ? (
          <p className="rounded-md border border-border-default bg-surface-raised p-4 text-sm text-text-secondary">
            No worrying patterns in the last {assessment.windowDays} days. Keep
            logging — sparse data hides early signals.
          </p>
        ) : (
          <ul className="space-y-2">
            {assessment.signals.map((s) => (
              <li
                key={s.key}
                className="rounded-md border border-border-default bg-surface-raised p-4"
              >
                <p className="font-medium">{s.label}</p>
                <p className="mt-1 text-xs text-text-secondary">{s.detail}</p>
                {s.weight > 0 && (
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-text-muted">
                    +{s.weight} risk points
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="recommendations" className="mb-6">
        <h2 id="recommendations" className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Suggested next steps
        </h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-text-secondary">
          {assessment.recommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="averages" className="mb-8">
        <h2 id="averages" className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          {assessment.windowDays}-day averages
        </h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(
            [
              ['Sleep', assessment.averages.sleep_hours, 'hrs'],
              ['Sleep quality', assessment.averages.sleep_quality, '/10'],
              ['Energy', assessment.averages.energy_level, '/10'],
              ['Mood', assessment.averages.mood, '/10'],
              ['Stress', assessment.averages.stress_level, '/10'],
              ['Voice', assessment.averages.voice_condition, '/10'],
            ] as const
          ).map(([label, value, unit]) => (
            <div
              key={label}
              className="rounded-md border border-border-default bg-surface p-3"
            >
              <dt className="text-xs text-text-muted">{label}</dt>
              <dd className="text-sm font-semibold">
                {value != null ? `${value.toFixed(1)} ${unit}` : '—'}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <RiseWellnessCallout />
    </main>
  )
}
