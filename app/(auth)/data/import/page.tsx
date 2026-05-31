import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, FileSpreadsheet } from 'lucide-react'
import { importTargets } from '@/lib/csv/import-targets'

export const metadata: Metadata = {
  title: 'CSV Import',
  robots: { index: false },
}

export default function ImportLandingPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/data"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Data Import/Export
      </Link>
      <h1 className="mb-2 text-2xl font-bold">CSV Import</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Pick what you want to import. The wizard will help you upload a
        CSV, map its columns to the right fields, preview a few rows,
        then run the import. Errors are shown row-by-row so you can fix
        and re-upload.
      </p>

      <ul className="space-y-3">
        {importTargets.map((t) => (
          <li key={t.id}>
            <Link
              href={`/data/import/${t.id}`}
              className="flex items-start justify-between gap-3 rounded-xl border border-border-default bg-surface-raised p-5 hover:border-primary-500/40 hover:bg-primary-500/5"
            >
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="mt-0.5 size-5 text-primary-600 dark:text-primary-400" aria-hidden />
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">{t.description}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Required: {t.fields.filter((f) => f.required).map((f) => f.label).join(', ') || 'none'}
                  </p>
                </div>
              </div>
              <ArrowRight className="mt-1 size-4 text-text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
