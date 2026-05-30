'use client'

import { useState } from 'react'
import { Camera, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { createExpense } from '@/lib/finances/actions'

interface Show {
  id: string
  date: string
  city: string
  state: string | null
  venue_name: string | null
}

interface ExtractedReceipt {
  amount: number | null
  vendor: string | null
  date: string | null
  category: string | null
  description: string | null
  is_tax_deductible: boolean | null
}

interface ExtractedResponse {
  receipt_url: string
  public_id: string
  extracted: ExtractedReceipt | null
  error?: string
}

export function AddExpenseForm({ tourId, shows }: { tourId: string; shows: Show[] }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [receipt, setReceipt] = useState<{
    file: File | null
    url: string | null
    publicId: string | null
  }>({ file: null, url: null, publicId: null })
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedReceipt | null>(null)
  const [extractError, setExtractError] = useState('')

  // Controlled form fields so we can pre-fill from AI extraction.
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [showId, setShowId] = useState('')
  const [description, setDescription] = useState('')
  const [taxDeductible, setTaxDeductible] = useState(false)

  async function onPickReceipt(file: File) {
    setExtractError('')
    setExtracting(true)
    setReceipt({ file, url: null, publicId: null })

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/expenses/extract-receipt', {
        method: 'POST',
        body: form,
      })
      const json = (await res.json().catch(() => ({}))) as ExtractedResponse
      if (!res.ok || !json.receipt_url) {
        setExtractError(json.error || `upload failed (${res.status})`)
        setReceipt({ file: null, url: null, publicId: null })
        return
      }
      setReceipt({ file, url: json.receipt_url, publicId: json.public_id })
      if (json.extracted) {
        setExtracted(json.extracted)
        applyExtraction(json.extracted)
      } else {
        setExtractError(
          'Uploaded — but the AI couldn\'t extract details. Fill the form manually.',
        )
      }
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : 'network error')
      setReceipt({ file: null, url: null, publicId: null })
    } finally {
      setExtracting(false)
    }
  }

  function applyExtraction(e: ExtractedReceipt) {
    if (e.amount !== null && e.amount > 0) setAmount(String(e.amount))
    if (e.date) setDate(e.date)
    if (e.category) setCategory(e.category)
    const desc = [e.vendor, e.description].filter(Boolean).join(' — ')
    if (desc) setDescription(desc)
    if (e.is_tax_deductible !== null) setTaxDeductible(e.is_tax_deductible)
  }

  async function removeReceipt() {
    if (receipt.publicId) {
      await fetch(
        `/api/expenses/extract-receipt?public_id=${encodeURIComponent(receipt.publicId)}`,
        { method: 'DELETE' },
      ).catch(() => {})
    }
    setReceipt({ file: null, url: null, publicId: null })
    setExtracted(null)
    setExtractError('')
  }

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    if (receipt.url) formData.set('receipt_url', receipt.url)
    const result = await createExpense(tourId, formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </div>
      )}

      {/* Receipt scanner panel */}
      <section
        aria-label="Receipt scanner"
        className="rounded-xl border border-primary-500/30 bg-primary-500/5 p-4"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          Snap a receipt — AI will fill the form
        </div>

        {!receipt.url && !extracting && (
          <div className="mt-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              <Camera className="h-4 w-4" aria-hidden="true" />
              Upload receipt
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onPickReceipt(f)
                }}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-text-muted">
              JPEG / PNG / WebP / HEIC, max 10MB. The image is stored with this
              expense; the AI estimate is editable.
            </p>
          </div>
        )}

        {extracting && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Uploading + reading the receipt…
          </div>
        )}

        {receipt.url && !extracting && (
          <div className="mt-3 flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receipt.url}
              alt="Uploaded receipt"
              className="h-24 w-24 rounded-md object-cover"
            />
            <div className="flex-1">
              {extracted ? (
                <p className="text-sm">
                  AI extracted {' '}
                  <strong>
                    {extracted.amount !== null ? `$${extracted.amount}` : 'amount unclear'}
                  </strong>
                  {extracted.vendor && ` from ${extracted.vendor}`}
                  {extracted.date && ` on ${extracted.date}`}
                  . Review the form below and edit as needed.
                </p>
              ) : (
                <p className="text-sm text-text-muted">
                  Receipt attached. Fill the form manually.
                </p>
              )}
              <button
                type="button"
                onClick={removeReceipt}
                className="mt-2 inline-flex items-center gap-1 text-xs text-error-600 hover:underline dark:text-error-500"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" /> Remove and start over
              </button>
            </div>
          </div>
        )}

        {extractError && (
          <p
            role="alert"
            className="mt-2 text-xs text-error-600 dark:text-error-500"
          >
            {extractError}
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium">
            Date <span aria-hidden="true" className="text-error-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            aria-required="true"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          />
        </div>

        <div>
          <label htmlFor="amount" className="mb-1 block text-sm font-medium">
            Amount ($) <span aria-hidden="true" className="text-error-500">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            aria-required="true"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium">
          Category <span aria-hidden="true" className="text-error-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          aria-required="true"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
        >
          <option value="">Select category...</option>
          <option value="travel">Travel</option>
          <option value="hotel">Hotel</option>
          <option value="per_diem">Per Diem</option>
          <option value="meals">Meals</option>
          <option value="equipment">Equipment</option>
          <option value="crew">Crew</option>
          <option value="merch">Merch</option>
          <option value="marketing">Marketing</option>
          <option value="insurance">Insurance</option>
          <option value="other">Other</option>
        </select>
      </div>

      {shows.length > 0 && (
        <div>
          <label htmlFor="show_id" className="mb-1 block text-sm font-medium">Show (optional)</label>
          <select
            id="show_id"
            name="show_id"
            value={showId}
            onChange={(e) => setShowId(e.target.value)}
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          >
            <option value="">General tour expense</option>
            {shows.map((show) => (
              <option key={show.id} value={show.id}>
                {new Date(show.date).toLocaleDateString()} — {show.venue_name || show.city}{show.state ? `, ${show.state}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="What was this expense for?"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_tax_deductible"
          checked={taxDeductible}
          onChange={(e) => setTaxDeductible(e.target.checked)}
          className="rounded accent-primary-600"
        />
        Tax deductible
      </label>

      {receipt.url && <input type="hidden" name="receipt_url" value={receipt.url} />}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
      >
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  )
}
