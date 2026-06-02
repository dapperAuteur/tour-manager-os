import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { StagePlotElement } from '@/lib/production/actions'
import { StagePlotEditor } from './stage-plot-editor'

export const metadata: Metadata = {
  title: 'Stage Plot Editor',
  robots: { index: false },
}

export default async function StagePlotEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: plot } = await supabase
    .from('stage_plots')
    .select(
      'id, name, description, stage_width, stage_depth, elements, is_default',
    )
    .eq('id', id)
    .maybeSingle()
  if (!plot) notFound()

  const elements: StagePlotElement[] = Array.isArray(plot.elements)
    ? (plot.elements as StagePlotElement[])
    : []

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/production/stage-plots"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> All stage plots
      </Link>
      <StagePlotEditor
        plotId={plot.id}
        initialElements={elements}
        initialMeta={{
          name: plot.name as string,
          description: (plot.description as string | null) ?? null,
          stage_width: (plot.stage_width as number | null) ?? null,
          stage_depth: (plot.stage_depth as number | null) ?? null,
        }}
      />
    </main>
  )
}
