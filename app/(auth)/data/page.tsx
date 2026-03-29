import type { Metadata } from 'next'
import { Download, Upload, FileSpreadsheet } from 'lucide-react'
import { csvTemplates } from '@/lib/csv/templates'
import { TemplateDownloadButton } from './template-download'

export const metadata: Metadata = { title: 'Data Import/Export', robots: { index: false } }

export default function DataPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Data Import / Export</h1>
        <p className="mt-1 text-sm text-text-secondary">Download CSV templates, import data, or export your data.</p>
      </div>

      {/* Templates */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">CSV Templates</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Download a template, fill it in with your data, then import it. Each template includes a sample row showing the expected format.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {csvTemplates.map((template) => (
            <div key={template.filename} className="rounded-xl border border-border-default bg-surface-raised p-5">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  <h3 className="font-semibold">{template.name}</h3>
                </div>
                <TemplateDownloadButton template={template} />
              </div>
              <p className="text-xs text-text-secondary">{template.description}</p>
              <p className="mt-2 text-xs text-text-muted">
                Columns: {template.headers.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Export Your Data</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Export data from individual pages using the Export CSV button available on:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Download className="h-4 w-4 text-text-muted" aria-hidden="true" />
            <span><strong>Tour Finances</strong> → Export all expenses for a tour</span>
          </li>
          <li className="flex items-center gap-2">
            <Download className="h-4 w-4 text-text-muted" aria-hidden="true" />
            <span><strong>Tax Center</strong> → Export state income + deduction summary</span>
          </li>
        </ul>
      </section>

      {/* Import */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Import Data</h2>
        <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-6">
          <div className="flex items-start gap-3">
            <Upload className="mt-0.5 h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">CSV Import Coming Soon</p>
              <p className="mt-1 text-xs text-text-secondary">
                We&apos;re building a CSV import wizard with column mapping and validation preview. For now, download the templates to see the expected data format, and use the forms in each module to add data manually.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
