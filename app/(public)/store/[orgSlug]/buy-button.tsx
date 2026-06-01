import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

/**
 * Server component — routes the fan to the embedded checkout page,
 * which collects the address and pulls live Shippo rates before
 * starting the Stripe Elements payment. The previous in-place POST to
 * /api/merch/checkout (hosted Stripe Checkout) still works as a
 * fallback for stores without Shippo configured — see
 * `checkout-client.tsx`.
 */
export function BuyButton({
  orgSlug,
  productId,
  productName,
}: {
  orgSlug: string
  productId: string
  productName: string
}) {
  return (
    <Link
      href={`/store/${orgSlug}/checkout/${productId}`}
      aria-label={`Buy ${productName}`}
      className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
    >
      <ShoppingBag className="size-3" aria-hidden /> Buy
    </Link>
  )
}
