'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { addTemplateItem, deleteTemplateItem } from '@/lib/rider/template-actions'

interface Item {
  id: string
  category: string
  description: string
  expected_quantity: number | null
  notes: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical',
  hospitality: 'Hospitality',
  dressing_room: 'Dressing Room',
  crew: 'Crew',
  transportation: 'Transportation',
  security: 'Security',
  other: 'Other',
}

export function TemplateEditor({ initial }: { initial: Item[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function action(formData: FormData) {
    setError(null)
    setBusy(true)
    const result = await addTemplateItem(formData)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    startTransition(() => router.refresh())
  }

  // Group by category for scanability.
  const byCategory = new Map<string, Item[]>()
  for (const i of initial) {
    if (!byCategory.has(i.category)) byCategory.set(i.category, [])
    byCategory.get(i.category)!.push(i)
  }

  return (
    <div className="space-y-5">
      <form
        action={action}
        className="space-y-3 rounded-xl border border-border-default bg-surface-raised p-5"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Add line item
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Category</span>
            <select
              name="category"
              defaultValue="hospitality"
              className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
            >
              {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium">Description</span>
            <input
              type="text"
              name="description"
              required
              maxLength={200}
              placeholder="2 bottles of still water per dressing room"
              className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Expected qty</span>
            <input
              type="number"
              name="expected_quantity"
              min="0"
              placeholder="2"
              className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium">Notes (optional)</span>
            <input
              type="text"
              name="notes"
              maxLength={200}
              placeholder="Any clarifications for the venue"
              className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="text-xs text-error-600 dark:text-error-500">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Plus className="size-3" aria-hidden /> {busy ? 'Adding…' : 'Add to template'}
        </button>
      </form>

      {initial.length === 0 ? (
        <p className="text-sm text-text-muted">
          No template items yet. Add one above.
        </p>
      ) : (
        Array.from(byCategory.entries()).map(([category, list]) => (
          <section
            key={category}
            aria-labelledby={`cat-${category}`}
            className="rounded-xl border border-border-default bg-surface-raised p-4"
          >
            <h2
              id={`cat-${category}`}
              className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted"
            >
              {CATEGORY_LABELS[category] || category} ({list.length})
            </h2>
            <ul className="space-y-2">
              {list.map((i) => (
                <li
                  key={i.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border-default bg-surface p-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {i.description}
                      {i.expected_quantity != null && (
                        <span className="ml-2 text-xs font-normal text-text-muted">
                          (qty {i.expected_quantity})
                        </span>
                      )}
                    </p>
                    {i.notes && (
                      <p className="mt-0.5 text-xs italic text-text-muted">
                        {i.notes}
                      </p>
                    )}
                  </div>
                  <DeleteButton itemId={i.id} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

function DeleteButton({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  async function go() {
    if (!window.confirm('Remove this template item?')) return
    setBusy(true)
    const result = await deleteTemplateItem(itemId)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    startTransition(() => router.refresh())
  }
  return (
    <button
      type="button"
      onClick={go}
      disabled={busy}
      aria-label="Delete template item"
      className="rounded p-1 text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  )
}
