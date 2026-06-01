import { Shippo } from 'shippo'

/**
 * Lazy Shippo client. Returns null if no token is configured so we can
 * fall back to the legacy three-tier flat-rate Checkout flow.
 */
let cached: Shippo | null = null
export function getShippo(): Shippo | null {
  const token = process.env.SHIPPO_API_TOKEN
  if (!token) return null
  if (cached) return cached
  cached = new Shippo({ apiKeyHeader: token })
  return cached
}

export function isShippoConfigured(): boolean {
  return !!process.env.SHIPPO_API_TOKEN
}

/**
 * Reasonable defaults so a product without explicit dimensions can
 * still get a rate quote. Numbers are approximate USPS weights for
 * typical music-merch SKUs. Bands should fill in real values on the
 * product editor for accuracy.
 */
export const CATEGORY_PACKAGE_DEFAULTS: Record<
  string,
  { weight_oz: number; length_in: number; width_in: number; height_in: number }
> = {
  apparel: { weight_oz: 8, length_in: 10, width_in: 8, height_in: 1 },
  vinyl: { weight_oz: 16, length_in: 13, width_in: 13, height_in: 1 },
  cd: { weight_oz: 4, length_in: 6, width_in: 5, height_in: 0.5 },
  poster: { weight_oz: 4, length_in: 18, width_in: 3, height_in: 3 },
  accessory: { weight_oz: 4, length_in: 6, width_in: 4, height_in: 2 },
  bundle: { weight_oz: 24, length_in: 13, width_in: 13, height_in: 3 },
  other: { weight_oz: 8, length_in: 10, width_in: 8, height_in: 2 },
}

export interface ProductDimensions {
  weight_oz: number | null
  length_in: number | null
  width_in: number | null
  height_in: number | null
}

export function resolveParcel(
  product: ProductDimensions & { category: string | null },
  quantity: number,
): {
  length: string
  width: string
  height: string
  distanceUnit: 'in'
  weight: string
  massUnit: 'oz'
} {
  const defaults =
    CATEGORY_PACKAGE_DEFAULTS[product.category || 'other'] ||
    CATEGORY_PACKAGE_DEFAULTS.other
  const weight = (product.weight_oz ?? defaults.weight_oz) * quantity
  // Don't grow length/width for multi-qty (we'd stack, not lay flat);
  // bump height proportionally instead.
  const length = product.length_in ?? defaults.length_in
  const width = product.width_in ?? defaults.width_in
  const heightPerUnit = product.height_in ?? defaults.height_in
  const height = heightPerUnit * quantity
  return {
    length: length.toFixed(2),
    width: width.toFixed(2),
    height: height.toFixed(2),
    distanceUnit: 'in',
    weight: weight.toFixed(2),
    massUnit: 'oz',
  }
}
