import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  getImportTarget,
  importTargets,
  type ImportTarget,
} from '@/lib/csv/import-targets'
import {
  listToursForImport,
  listVenuesForImport,
} from '@/lib/csv/import-actions'
import { ImportWizard } from './import-wizard'

export const metadata: Metadata = {
  title: 'CSV Import',
  robots: { index: false },
}

export async function generateStaticParams() {
  return importTargets.map((t) => ({ target: t.id }))
}

export default async function ImportTargetPage({
  params,
}: {
  params: Promise<{ target: string }>
}) {
  const { target: targetId } = await params
  const target: ImportTarget | undefined = getImportTarget(targetId)
  if (!target) notFound()

  const tours = target.requiresTour ? await listToursForImport() : []
  const venues = target.id === 'contacts' ? await listVenuesForImport() : []

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/data/import"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> All import targets
      </Link>
      <h1 className="mb-1 text-2xl font-bold">Import {target.name}</h1>
      <p className="mb-6 text-sm text-text-secondary">{target.description}</p>
      <ImportWizard target={target} tours={tours} venues={venues} />
    </main>
  )
}
