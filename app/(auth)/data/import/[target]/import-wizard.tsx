'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Upload, Loader2 } from 'lucide-react'
import { parseCsv, rowsToObjects } from '@/lib/csv/parse'
import type { ImportTarget } from '@/lib/csv/import-targets'
import {
  runCsvImport,
  type ImportResult,
} from '@/lib/csv/import-actions'

interface WizardProps {
  target: ImportTarget
  tours: { id: string; name: string }[]
  venues: { id: string; name: string }[]
}

type Step = 'context' | 'upload' | 'map' | 'preview' | 'result'

export function ImportWizard({ target, tours, venues }: WizardProps) {
  const [step, setStep] = useState<Step>(
    target.requiresTour || target.id === 'contacts' ? 'context' : 'upload',
  )
  const [tourId, setTourId] = useState<string>('')
  const [venueId, setVenueId] = useState<string>('')
  const [filename, setFilename] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const requiredKeys = useMemo(
    () => target.fields.filter((f) => f.required).map((f) => f.key),
    [target],
  )

  const mappedRows = useMemo(() => {
    return rows.map((r) => {
      const mapped: Record<string, string> = {}
      for (const f of target.fields) {
        const sourceCol = mapping[f.key]
        mapped[f.key] = sourceCol ? r[sourceCol] || '' : ''
      }
      return mapped
    })
  }, [rows, mapping, target])

  function handleFile(file: File) {
    setError(null)
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const parsed = parseCsv(text)
      const result = rowsToObjects(parsed)
      if (!result) {
        setError('File is empty or unreadable.')
        return
      }
      setHeaders(result.headers)
      setRows(result.rows)
      // Best-effort auto-mapping: case-insensitive match on label.
      const auto: Record<string, string> = {}
      for (const f of target.fields) {
        const match = result.headers.find(
          (h) =>
            h.toLowerCase().replace(/[^a-z0-9]/g, '') ===
            f.label.toLowerCase().replace(/[^a-z0-9]/g, ''),
        )
        if (match) auto[f.key] = match
      }
      setMapping(auto)
      setStep('map')
    }
    reader.onerror = () => setError('Could not read the file.')
    reader.readAsText(file)
  }

  function canProceedFromContext() {
    if (target.requiresTour && !tourId) return false
    if (target.id === 'contacts' && !venueId) return false
    return true
  }

  function canProceedFromMap() {
    return requiredKeys.every((k) => mapping[k] && mapping[k].length > 0)
  }

  async function runImport() {
    setRunning(true)
    setError(null)
    const res = await runCsvImport({
      target: target.id,
      tourId: tourId || undefined,
      venueId: venueId || undefined,
      filename,
      rows: mappedRows,
    })
    setResult(res)
    setRunning(false)
    setStep('result')
  }

  return (
    <div>
      <StepIndicator step={step} target={target} />

      {step === 'context' && (
        <section className="rounded-xl border border-border-default bg-surface-raised p-5">
          {target.requiresTour && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Tour</span>
              <select
                value={tourId}
                onChange={(e) => setTourId(e.target.value)}
                className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm"
              >
                <option value="">Select a tour…</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {tours.length === 0 && (
                <p className="mt-1 text-xs text-text-muted">
                  No tours yet. <Link href="/tours/new" className="underline">Create one</Link> first.
                </p>
              )}
            </label>
          )}
          {target.id === 'contacts' && (
            <label className="mt-3 block">
              <span className="mb-1 block text-sm font-medium">Venue</span>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm"
              >
                <option value="">Select a venue…</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {venues.length === 0 && (
                <p className="mt-1 text-xs text-text-muted">
                  No venues yet. <Link href="/venues" className="underline">Browse venues</Link> first.
                </p>
              )}
            </label>
          )}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={!canProceedFromContext()}
              onClick={() => setStep('upload')}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 'upload' && (
        <section className="rounded-xl border border-border-default bg-surface-raised p-5">
          <p className="mb-3 text-sm text-text-secondary">
            Choose a CSV file. The first row should be headers. Download
            the template on the <Link href="/data" className="underline">data page</Link> if you need
            a starting point.
          </p>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border-default bg-surface px-4 py-8 text-sm text-text-secondary hover:border-primary-500/40 hover:bg-primary-500/5">
            <Upload className="size-4" aria-hidden />
            Choose CSV file…
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm text-error-600 dark:text-error-500">{error}</p>
          )}
        </section>
      )}

      {step === 'map' && (
        <section className="rounded-xl border border-border-default bg-surface-raised p-5">
          <p className="mb-3 text-sm text-text-secondary">
            Tell us which column in <span className="font-medium">{filename}</span> maps to each field.
            We auto-matched whatever we could.
          </p>
          <ul className="space-y-3">
            {target.fields.map((f) => (
              <li key={f.key} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-default bg-surface p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {f.label}
                    {f.required && <span className="ml-1 text-error-500">*</span>}
                  </p>
                  {f.hint && <p className="text-xs text-text-muted">{f.hint}</p>}
                </div>
                <select
                  value={mapping[f.key] || ''}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [f.key]: e.target.value }))
                  }
                  className="rounded-md border border-border-default bg-surface px-2 py-1 text-sm"
                >
                  <option value="">— Skip —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between">
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="rounded-md border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!canProceedFromMap()}
              onClick={() => setStep('preview')}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              Preview {rows.length} rows
            </button>
          </div>
        </section>
      )}

      {step === 'preview' && (
        <section className="rounded-xl border border-border-default bg-surface-raised p-5">
          <p className="mb-3 text-sm text-text-secondary">
            Showing the first {Math.min(5, mappedRows.length)} of {mappedRows.length} rows.
            If they look right, click Run import.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-default text-left text-text-muted">
                  <th className="pb-2 pr-3" scope="col">#</th>
                  {target.fields.map((f) => (
                    <th key={f.key} className="pb-2 pr-3" scope="col">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mappedRows.slice(0, 5).map((r, idx) => (
                  <tr key={idx} className="border-b border-border-default">
                    <td className="py-2 pr-3 text-text-muted">{idx + 2}</td>
                    {target.fields.map((f) => (
                      <td key={f.key} className="py-2 pr-3">
                        {r[f.key] || <span className="text-text-muted">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap justify-between gap-2">
            <button
              type="button"
              onClick={() => setStep('map')}
              className="rounded-md border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt"
            >
              Back
            </button>
            <button
              type="button"
              disabled={running}
              onClick={runImport}
              className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {running && <Loader2 className="size-3 animate-spin" aria-hidden />}
              Run import
            </button>
          </div>
        </section>
      )}

      {step === 'result' && result && (
        <section className="rounded-xl border border-border-default bg-surface-raised p-5">
          <div className="flex items-start gap-3">
            {result.imported > 0 ? (
              <CheckCircle2 className="mt-0.5 size-5 text-success-600 dark:text-success-500" aria-hidden />
            ) : (
              <AlertCircle className="mt-0.5 size-5 text-error-600 dark:text-error-500" aria-hidden />
            )}
            <div>
              <p className="font-semibold">
                Imported {result.imported} of {result.total} rows.
              </p>
              {result.skipped > 0 && (
                <p className="text-sm text-text-secondary">
                  Skipped {result.skipped} row{result.skipped === 1 ? '' : 's'} due to errors below.
                </p>
              )}
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-4 max-h-80 overflow-auto rounded-md border border-border-default">
              <table className="w-full text-xs">
                <thead className="bg-surface-alt text-left">
                  <tr>
                    <th className="px-3 py-2" scope="col">Row</th>
                    <th className="px-3 py-2" scope="col">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((e, i) => (
                    <tr key={i} className="border-t border-border-default">
                      <td className="px-3 py-2 align-top text-text-muted">{e.row}</td>
                      <td className="px-3 py-2 text-error-600 dark:text-error-500">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/data/import"
              className="rounded-md border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt"
            >
              Import something else
            </Link>
            <button
              type="button"
              onClick={() => {
                setStep(target.requiresTour || target.id === 'contacts' ? 'context' : 'upload')
                setResult(null)
                setRows([])
                setHeaders([])
                setMapping({})
                setFilename('')
              }}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Start over
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

function StepIndicator({ step, target }: { step: Step; target: ImportTarget }) {
  const needsContext = target.requiresTour || target.id === 'contacts'
  const steps: { key: Step; label: string }[] = []
  if (needsContext) steps.push({ key: 'context', label: 'Where' })
  steps.push({ key: 'upload', label: 'Upload' })
  steps.push({ key: 'map', label: 'Map columns' })
  steps.push({ key: 'preview', label: 'Preview' })
  steps.push({ key: 'result', label: 'Done' })

  const currentIdx = steps.findIndex((s) => s.key === step)

  return (
    <ol className="mb-5 flex flex-wrap gap-2 text-xs text-text-muted">
      {steps.map((s, i) => (
        <li
          key={s.key}
          className={`rounded-full px-2.5 py-1 ${
            i === currentIdx
              ? 'bg-primary-500/15 font-semibold text-primary-700 dark:text-primary-300'
              : i < currentIdx
                ? 'text-text-secondary'
                : ''
          }`}
        >
          {i + 1}. {s.label}
        </li>
      ))}
    </ol>
  )
}
