import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, LayoutGrid } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getStagePlots } from '@/lib/production/queries'

export const metadata: Metadata = { title: 'Stage Plots', robots: { index: false } }

export default async function StagePlotsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="p-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const plots = await getStagePlots(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/production" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Production Bible</Link>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stage Plots</h1>
        <Link href="/production/stage-plots/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> New Plot
        </Link>
      </div>

      {plots.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <LayoutGrid className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No stage plots yet. Create one to define your stage layout.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plots.map((plot) => {
            const showInfo = plot.shows as { date: string; city: string; venue_name: string | null } | null
            return (
              <div key={plot.id} className="rounded-xl border border-border-default bg-surface-raised p-5">
                <div className="mb-2 flex items-start justify-between">
                  <h2 className="font-semibold">{plot.name}</h2>
                  {plot.is_default && <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">Default</span>}
                </div>
                {plot.description && <p className="mb-2 text-sm text-text-secondary">{plot.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                  {plot.stage_width && plot.stage_depth && (
                    <span>{plot.stage_width} x {plot.stage_depth} ft</span>
                  )}
                  {showInfo && <span>{showInfo.venue_name || showInfo.city}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
