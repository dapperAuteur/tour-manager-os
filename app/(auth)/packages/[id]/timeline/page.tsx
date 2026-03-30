import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Music } from 'lucide-react'
import { getTourPackageWithActs, getPackageTimelines, getProductionTimeline } from '@/lib/packages/queries'
import { AddTimelineBlockForm } from './add-block-form'

export const metadata: Metadata = { title: 'Production Timeline', robots: { index: false } }

const blockTypeColors: Record<string, string> = {
  load_in: 'bg-text-muted/20 text-text-muted',
  soundcheck: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  changeover: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  performance: 'bg-success-500/20 text-success-600 dark:text-success-500',
  meet_greet: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  doors: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  curfew: 'bg-error-500/20 text-error-500',
  break: 'bg-surface-alt text-text-muted',
  other: 'bg-surface-alt text-text-muted',
}

export default async function TimelinePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string }> }) {
  const { id } = await params
  const { date } = await searchParams
  const selectedDate = date || new Date().toISOString().split('T')[0]

  let pkgData
  try { pkgData = await getTourPackageWithActs(id) } catch { notFound() }

  const timelines = await getPackageTimelines(id)
  const { blocks } = await getProductionTimeline(id, selectedDate)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={`/packages/${id}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; {pkgData.package.name}</Link>

      <h1 className="mb-2 text-2xl font-bold">Production Timeline</h1>
      <p className="mb-8 text-sm text-text-secondary">Coordinate load-in, soundcheck, changeovers, and performances across all acts.</p>

      {/* Date selector */}
      {timelines.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {timelines.map((t) => (
            <Link
              key={t.id}
              href={`/packages/${id}/timeline?date=${t.date}`}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${t.date === selectedDate ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-border-default hover:bg-surface-alt'}`}
            >
              {new Date(t.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Link>
          ))}
        </div>
      )}

      {/* Timeline blocks */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>

        {blocks.length === 0 ? (
          <div className="rounded-xl border border-border-default bg-surface-raised p-6 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">No timeline blocks for this date. Add one below.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blocks.map((block) => {
              const actName = (block.package_acts as { act_name: string; act_type: string } | null)?.act_name
              return (
                <div key={block.id} className="flex items-center gap-4 rounded-lg border border-border-default bg-surface-raised p-3">
                  <div className="w-20 text-right">
                    <span className="font-mono text-sm font-semibold">{block.start_time}</span>
                    {block.end_time && <span className="block font-mono text-xs text-text-muted">{block.end_time}</span>}
                  </div>
                  <div className="h-8 w-0.5 bg-border-default" aria-hidden="true" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${blockTypeColors[block.block_type]}`}>
                        {block.block_type.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium">{block.label}</span>
                    </div>
                    {actName && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                        <Music className="h-3 w-3" aria-hidden="true" /> {actName}
                      </p>
                    )}
                    {block.notes && <p className="mt-0.5 text-xs text-text-muted">{block.notes}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add block */}
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <h3 className="mb-4 font-semibold">Add Timeline Block</h3>
        <AddTimelineBlockForm packageId={id} date={selectedDate} acts={pkgData.acts} />
      </div>
    </main>
  )
}
