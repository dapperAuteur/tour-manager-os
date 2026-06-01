'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateShipFromAddress } from '@/lib/merch/ship-from-actions'

interface Initial {
  ship_from_name?: string | null
  ship_from_line1?: string | null
  ship_from_line2?: string | null
  ship_from_city?: string | null
  ship_from_state?: string | null
  ship_from_postal_code?: string | null
  ship_from_country?: string | null
  ship_from_phone?: string | null
}

export function ShipFromForm({ initial }: { initial: Initial }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function action(formData: FormData) {
    setBusy(true)
    setError(null)
    setSaved(false)
    const result = await updateShipFromAddress(formData)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setSaved(true)
    startTransition(() => router.refresh())
  }

  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-border-default bg-surface-raised p-5"
    >
      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-xs text-success-600 dark:text-success-500">
          Saved.
        </p>
      )}
      <Row label="Name (band or business)" name="name" defaultValue={initial.ship_from_name || ''} />
      <Row label="Address" name="line1" required defaultValue={initial.ship_from_line1 || ''} />
      <Row label="Apartment, suite, etc. (optional)" name="line2" defaultValue={initial.ship_from_line2 || ''} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Row label="City" name="city" required defaultValue={initial.ship_from_city || ''} />
        <Row label="State / Region" name="state" defaultValue={initial.ship_from_state || ''} />
        <Row label="Postal code" name="postal_code" required defaultValue={initial.ship_from_postal_code || ''} />
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Country</span>
        <select
          name="country"
          required
          defaultValue={initial.ship_from_country || 'US'}
          className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="NL">Netherlands</option>
        </select>
      </label>
      <Row label="Phone (Shippo requires for some carriers)" name="phone" type="tel" defaultValue={initial.ship_from_phone || ''} />
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {busy ? 'Saving…' : 'Save ship-from address'}
      </button>
    </form>
  )
}

function Row({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
      />
    </label>
  )
}
