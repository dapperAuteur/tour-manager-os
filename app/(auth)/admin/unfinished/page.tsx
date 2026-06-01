import type { Metadata } from 'next'
import { AlertTriangle, ClipboardList, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import {
  DRIFT_ITEMS,
  PLANNED_SECTIONS,
  RECENTLY_SHIPPED,
  LAST_SYNCED_DATE,
  TOTAL_PLANNED,
  TOTAL_DRIFT,
} from '@/lib/admin/unfinished-tracker'

export const metadata: Metadata = {
  title: 'Unfinished Tracker',
  robots: { index: false },
}

export default async function AdminUnfinishedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-text-secondary">Admin access required.</p>
      </main>
    )
  }

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Unfinished phase tracker</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Every roadmap item still open, plus &ldquo;audit drift&rdquo;
            (claimed done in roadmap but no code). Source markdown:
            <code className="ml-1 rounded bg-surface-alt px-1 text-xs">plans/02-unfinished-tracker.md</code>
            (gitignored &mdash; lives in the operator&apos;s clone).
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Last synced with <code>ROADMAP.md</code>: {LAST_SYNCED_DATE}
          </p>
        </div>
        <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">
          Super Admin
        </span>
      </header>

      <section
        aria-labelledby="summary"
        className="mb-8 grid gap-3 sm:grid-cols-3"
      >
        <h2 id="summary" className="sr-only">Summary</h2>
        <StatCard
          icon={AlertTriangle}
          label="Audit drift items"
          value={TOTAL_DRIFT}
          tone="warning"
        />
        <StatCard
          icon={ClipboardList}
          label="Planned items"
          value={TOTAL_PLANNED}
          tone="default"
        />
        <StatCard
          icon={CheckCircle2}
          label="Shipped (recent)"
          value={RECENTLY_SHIPPED.length}
          tone="success"
        />
      </section>

      {/* Audit drift — top of page so the operator sees it first */}
      <section
        aria-labelledby="drift-heading"
        className="mb-10 rounded-xl border border-warning-500/30 bg-warning-500/5 p-5"
      >
        <header className="mb-3 flex items-center gap-2">
          <AlertTriangle
            className="size-5 text-warning-600 dark:text-warning-500"
            aria-hidden="true"
          />
          <h2 id="drift-heading" className="text-lg font-semibold">
            Audit drift &mdash; claimed shipped but no code
          </h2>
        </header>
        <p className="mb-3 text-sm text-text-secondary">
          Pick a side per item: ship the missing code, or downgrade the
          roadmap entry to 📋 so the public docs stop lying.
        </p>
        <ul className="space-y-3">
          {DRIFT_ITEMS.map((item) => (
            <li
              key={item.key}
              className="rounded-md border border-border-default bg-surface p-3"
            >
              <p className="font-medium">{item.label}</p>
              {item.detail && (
                <p className="mt-1 text-xs text-text-muted">{item.detail}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Planned — grouped by phase */}
      <section aria-labelledby="planned-heading" className="mb-10">
        <header className="mb-4 flex items-center gap-2">
          <ClipboardList className="size-5 text-text-secondary" aria-hidden="true" />
          <h2 id="planned-heading" className="text-lg font-semibold">
            Planned (📋)
          </h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {PLANNED_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-border-default bg-surface-raised p-4"
            >
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
                {section.title}
              </h3>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item.key} className="flex items-start gap-2 text-sm">
                    <span
                      className="mt-1 size-1.5 shrink-0 rounded-full bg-text-muted/40"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p>{item.label}</p>
                      {item.detail && (
                        <p className="mt-0.5 text-xs text-text-muted">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Recently shipped */}
      <section aria-labelledby="shipped-heading">
        <header className="mb-3 flex items-center gap-2">
          <CheckCircle2
            className="size-5 text-success-600 dark:text-success-500"
            aria-hidden="true"
          />
          <h2 id="shipped-heading" className="text-lg font-semibold">
            Recently shipped
          </h2>
        </header>
        <ul className="space-y-1.5 text-sm">
          {RECENTLY_SHIPPED.map((s) => (
            <li
              key={s.branch}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border-default bg-surface p-3"
            >
              <CheckCircle2
                className="size-4 text-success-600 dark:text-success-500"
                aria-hidden="true"
              />
              <span>{s.label}</span>
              <code className="ml-auto rounded bg-surface-alt px-1.5 py-0.5 text-xs">
                {s.branch}
              </code>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  tone: 'warning' | 'default' | 'success'
}) {
  const iconColor =
    tone === 'warning'
      ? 'text-warning-600 dark:text-warning-500'
      : tone === 'success'
        ? 'text-success-600 dark:text-success-500'
        : 'text-text-muted'
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        <Icon className={`size-5 ${iconColor}`} />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}
