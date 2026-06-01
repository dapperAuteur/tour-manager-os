'use client'

import { useState, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'

interface Rate {
  rate_id: string
  provider: string
  service: string
  amount_cents: number
  estimated_days: number | null
  currency: string
}

type Step = 'address' | 'rates' | 'payment'

interface CheckoutClientProps {
  orgSlug: string
  productId: string
  productName: string
  productPriceCents: number
  quantity: number
  stripePublishableKey: string
}

export function CheckoutClient({
  orgSlug,
  productId,
  productName,
  productPriceCents,
  quantity,
  stripePublishableKey,
}: CheckoutClientProps) {
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    [stripePublishableKey],
  )

  const [step, setStep] = useState<Step>('address')
  const [fanName, setFanName] = useState('')
  const [fanEmail, setFanEmail] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [stateOrRegion, setStateOrRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('US')

  const [rates, setRates] = useState<Rate[]>([])
  const [chosenRate, setChosenRate] = useState<Rate | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [totalCents, setTotalCents] = useState<number | null>(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const itemsTotal = productPriceCents * quantity

  async function fetchRates() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/merch/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          org_slug: orgSlug,
          ship_to: {
            name: fanName,
            line1,
            line2,
            city,
            state: stateOrRegion,
            postal_code: postalCode,
            country,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not fetch shipping rates.')
        setBusy(false)
        return
      }
      setRates(data.rates || [])
      setStep('rates')
    } catch {
      setError('Network error fetching rates.')
    }
    setBusy(false)
  }

  async function startPayment(rate: Rate) {
    setBusy(true)
    setError(null)
    setChosenRate(rate)
    try {
      const res = await fetch('/api/merch/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          org_slug: orgSlug,
          rate_id: rate.rate_id,
          shipping_amount_cents: rate.amount_cents,
          shipping_carrier: rate.provider,
          shipping_service: rate.service,
          fan_email: fanEmail,
          fan_name: fanName,
          ship_to: {
            line1,
            line2,
            city,
            state: stateOrRegion,
            postal_code: postalCode,
            country,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.client_secret) {
        setError(data.error || 'Could not start payment.')
        setBusy(false)
        return
      }
      setClientSecret(data.client_secret)
      setTotalCents(data.total_cents)
      setStep('payment')
    } catch {
      setError('Network error starting payment.')
    }
    setBusy(false)
  }

  if (!stripePromise) {
    return (
      <div className="rounded-xl border border-error-500/30 bg-error-500/5 p-5 text-sm">
        Stripe is not configured. Set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.
      </div>
    )
  }

  return (
    <div>
      <Steps current={step} />

      {step === 'address' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            fetchRates()
          }}
          className="space-y-3 rounded-xl border border-border-default bg-surface-raised p-5"
        >
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Where should we ship it?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Name" required value={fanName} setValue={setFanName} />
            <Input
              label="Email"
              type="email"
              required
              value={fanEmail}
              setValue={setFanEmail}
            />
          </div>
          <Input label="Address" required value={line1} setValue={setLine1} />
          <Input label="Apartment, suite, etc. (optional)" value={line2} setValue={setLine2} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="City" required value={city} setValue={setCity} />
            <Input label="State / Region" value={stateOrRegion} setValue={setStateOrRegion} />
            <Input label="Postal code" required value={postalCode} setValue={setPostalCode} />
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="NZ">New Zealand</option>
              <option value="IE">Ireland</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="NL">Netherlands</option>
              <option value="ES">Spain</option>
              <option value="IT">Italy</option>
              <option value="SE">Sweden</option>
              <option value="JP">Japan</option>
            </select>
          </label>
          {error && (
            <p role="alert" className="text-xs text-error-600 dark:text-error-500">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {busy && <Loader2 className="size-3 animate-spin" aria-hidden />}
            Get shipping rates
          </button>
        </form>
      )}

      {step === 'rates' && (
        <div className="space-y-3 rounded-xl border border-border-default bg-surface-raised p-5">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Pick a shipping option
          </h2>
          <ul className="space-y-2">
            {rates.map((r) => (
              <li key={r.rate_id}>
                <button
                  type="button"
                  onClick={() => startPayment(r)}
                  disabled={busy}
                  className="flex w-full items-center justify-between rounded-md border border-border-default bg-surface p-3 text-left text-sm hover:border-primary-500 disabled:opacity-50"
                >
                  <div>
                    <p className="font-medium">
                      {r.provider} {r.service}
                    </p>
                    {r.estimated_days != null && (
                      <p className="text-xs text-text-muted">
                        ≈ {r.estimated_days} day{r.estimated_days === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold">
                    ${(r.amount_cents / 100).toFixed(2)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setStep('address')}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            ← Edit address
          </button>
          {error && (
            <p role="alert" className="text-xs text-error-600 dark:text-error-500">
              {error}
            </p>
          )}
        </div>
      )}

      {step === 'payment' && clientSecret && (
        <div className="rounded-xl border border-border-default bg-surface-raised p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Payment
          </h2>
          <OrderSummary
            productName={productName}
            quantity={quantity}
            itemsTotalCents={itemsTotal}
            shipping={chosenRate}
            totalCents={totalCents ?? itemsTotal + (chosenRate?.amount_cents || 0)}
          />
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: 'stripe' } }}
          >
            <PaymentForm orgSlug={orgSlug} onError={setError} />
          </Elements>
          {error && (
            <p role="alert" className="mt-3 text-xs text-error-600 dark:text-error-500">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Steps({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'address', label: '1. Address' },
    { key: 'rates', label: '2. Shipping' },
    { key: 'payment', label: '3. Payment' },
  ]
  const idx = steps.findIndex((s) => s.key === current)
  return (
    <ol className="mb-5 flex flex-wrap gap-2 text-xs">
      {steps.map((s, i) => (
        <li
          key={s.key}
          className={`rounded-full px-2.5 py-1 ${
            i === idx
              ? 'bg-primary-500/15 font-semibold text-primary-700 dark:text-primary-300'
              : i < idx
                ? 'text-text-secondary'
                : 'text-text-muted'
          }`}
        >
          {s.label}
        </li>
      ))}
    </ol>
  )
}

function OrderSummary({
  productName,
  quantity,
  itemsTotalCents,
  shipping,
  totalCents,
}: {
  productName: string
  quantity: number
  itemsTotalCents: number
  shipping: Rate | null
  totalCents: number
}) {
  return (
    <div className="mb-4 rounded-md border border-border-default bg-surface p-3 text-sm">
      <div className="flex items-center justify-between">
        <span>
          {quantity} × {productName}
        </span>
        <span>${(itemsTotalCents / 100).toFixed(2)}</span>
      </div>
      {shipping && (
        <div className="mt-1 flex items-center justify-between text-text-muted">
          <span>
            {shipping.provider} {shipping.service}
          </span>
          <span>${(shipping.amount_cents / 100).toFixed(2)}</span>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between border-t border-border-default pt-2 font-semibold">
        <span>Total</span>
        <span>${(totalCents / 100).toFixed(2)}</span>
      </div>
    </div>
  )
}

function PaymentForm({
  orgSlug,
  onError,
}: {
  orgSlug: string
  onError: (msg: string | null) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setBusy(true)
    onError(null)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store/${orgSlug}/order/success`,
      },
    })
    if (error) {
      onError(error.message || 'Payment failed.')
      setBusy(false)
    }
    // On success, Stripe redirects to return_url.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || busy}
        className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {busy && <Loader2 className="size-3 animate-spin" aria-hidden />}
        Pay now
      </button>
    </form>
  )
}

function Input({
  label,
  value,
  setValue,
  type = 'text',
  required,
}: {
  label: string
  value: string
  setValue: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
      />
    </label>
  )
}

export function HostedFallbackButton({
  orgSlug,
  productId,
  quantity,
}: {
  orgSlug: string
  productId: string
  quantity: number
}) {
  const [busy, setBusy] = useState(false)
  async function go() {
    setBusy(true)
    const res = await fetch('/api/merch/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity, org_slug: orgSlug }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setBusy(false)
      window.alert(data.error || 'Could not start checkout.')
    }
  }
  return (
    <button
      type="button"
      onClick={go}
      disabled={busy}
      className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
    >
      {busy && <Loader2 className="size-3 animate-spin" aria-hidden />}
      Continue to Stripe Checkout
    </button>
  )
}
