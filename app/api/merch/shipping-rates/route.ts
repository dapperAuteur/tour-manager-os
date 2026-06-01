import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/observability/logger'
import { getShippo, resolveParcel } from '@/lib/shipping/shippo'

/**
 * Returns live Shippo rate quotes for a product + destination address.
 * Public — no auth required. Validates the org's ship-from address is
 * configured before calling Shippo (otherwise rates make no sense).
 *
 * Response: { rates: [{rate_id, provider, service, amount_cents,
 * estimated_days}], rates_expire_at }
 */
export async function POST(request: Request) {
  const shippo = getShippo()
  if (!shippo) {
    return NextResponse.json(
      { error: 'Live shipping rates not available — Shippo not configured.' },
      { status: 503 },
    )
  }

  let body: {
    product_id?: string
    quantity?: number
    org_slug?: string
    ship_to?: {
      name?: string
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const productId = body.product_id?.trim()
  const orgSlug = body.org_slug?.trim()
  const quantity = Math.min(Math.max(Number(body.quantity || 1), 1), 10)
  const to = body.ship_to || {}

  if (!productId || !orgSlug) {
    return NextResponse.json(
      { error: 'product_id and org_slug are required.' },
      { status: 400 },
    )
  }
  if (!to.line1 || !to.city || !to.postal_code || !to.country) {
    return NextResponse.json(
      {
        error:
          'Shipping address requires street, city, postal code, and country.',
      },
      { status: 400 },
    )
  }

  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select(
      'id, name, ship_from_name, ship_from_line1, ship_from_line2, ship_from_city, ship_from_state, ship_from_postal_code, ship_from_country, ship_from_phone',
    )
    .eq('slug', orgSlug)
    .maybeSingle()
  if (!org) {
    return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
  }
  if (
    !org.ship_from_line1 ||
    !org.ship_from_city ||
    !org.ship_from_postal_code ||
    !org.ship_from_country
  ) {
    return NextResponse.json(
      {
        error:
          'This store has not configured a ship-from address yet. Ask the band to set it in Settings.',
      },
      { status: 503 },
    )
  }

  const { data: product } = await admin
    .from('merch_products')
    .select(
      'id, name, description, price, image_url, active, org_id, category, weight_oz, length_in, width_in, height_in',
    )
    .eq('id', productId)
    .eq('org_id', org.id)
    .maybeSingle()
  if (!product || !product.active) {
    return NextResponse.json(
      { error: 'Product not available.' },
      { status: 404 },
    )
  }

  const parcel = resolveParcel(
    {
      category: product.category,
      weight_oz: product.weight_oz as number | null,
      length_in: product.length_in as number | null,
      width_in: product.width_in as number | null,
      height_in: product.height_in as number | null,
    },
    quantity,
  )

  try {
    const shipment = await shippo.shipments.create({
      addressFrom: {
        name: org.ship_from_name || org.name,
        street1: org.ship_from_line1,
        street2: org.ship_from_line2 || undefined,
        city: org.ship_from_city,
        state: org.ship_from_state || undefined,
        zip: org.ship_from_postal_code,
        country: org.ship_from_country,
        phone: org.ship_from_phone || undefined,
      },
      addressTo: {
        name: to.name || 'Customer',
        street1: to.line1,
        street2: to.line2 || undefined,
        city: to.city,
        state: to.state || undefined,
        zip: to.postal_code,
        country: to.country,
      },
      parcels: [parcel],
      async: false,
    })

    const rates = (shipment.rates || [])
      .map((r) => ({
        rate_id: r.objectId,
        provider: r.provider,
        service: r.servicelevel?.name || 'Standard',
        amount_cents: Math.round(Number(r.amount || 0) * 100),
        estimated_days: r.estimatedDays ?? null,
        currency: r.currency || 'USD',
      }))
      .filter((r) => r.amount_cents > 0)
      .sort((a, b) => a.amount_cents - b.amount_cents)

    if (rates.length === 0) {
      return NextResponse.json(
        {
          error:
            'No shipping options available to this address. Double-check the postal code or try another address.',
        },
        { status: 422 },
      )
    }

    return NextResponse.json({ rates })
  } catch (err) {
    logError('merch.shipping_rates.failed', err, {
      org_slug: orgSlug,
      product_id: productId,
    })
    return NextResponse.json(
      { error: 'Could not fetch shipping rates. Please try again.' },
      { status: 502 },
    )
  }
}
