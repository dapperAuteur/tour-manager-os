import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildQuickBooksCsv,
  buildXeroCsv,
  type ExpenseRow,
} from '@/lib/finances/accounting-export'

/**
 * GET /api/finances/accounting-export?tour_id=...&format=quickbooks|xero
 *
 * Returns a CSV the user can drop into the corresponding accounting
 * app's bank-feed importer.
 *
 * - quickbooks → Date,Description,Amount,Category (negative amounts)
 * - xero → *Date,*Amount,Payee,Description,Reference,Account Code
 *
 * Auth: signed-in user must be an org member of the tour's org. The
 * underlying expenses query already enforces RLS on `expenses`.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const tourId = url.searchParams.get('tour_id')
  const format = (url.searchParams.get('format') || 'quickbooks').toLowerCase()
  if (!tourId) {
    return NextResponse.json({ error: 'tour_id required' }, { status: 400 })
  }
  if (format !== 'quickbooks' && format !== 'xero') {
    return NextResponse.json(
      { error: 'format must be quickbooks or xero' },
      { status: 400 },
    )
  }

  const { data: tour } = await supabase
    .from('tours')
    .select('id, name')
    .eq('id', tourId)
    .maybeSingle()
  if (!tour) {
    return NextResponse.json({ error: 'tour not found' }, { status: 404 })
  }

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select(
      `date, amount, category, description, show_id,
       shows:show_id(city, state, venue_name, date)`,
    )
    .eq('tour_id', tourId)
    .order('date', { ascending: true })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows: ExpenseRow[] = (expenses || []).map((row) => {
    const show = row.shows as unknown as
      | {
          city: string | null
          state: string | null
          venue_name: string | null
          date: string | null
        }
      | null
    const show_label = show
      ? [show.venue_name || show.city, show.state, show.date]
          .filter(Boolean)
          .join(' · ')
      : null
    return {
      date: row.date as string,
      amount: Number(row.amount),
      category: row.category as string,
      description: (row.description as string | null) ?? null,
      show_id: (row.show_id as string | null) ?? null,
      show_label,
    }
  })

  const body =
    format === 'xero' ? buildXeroCsv(rows) : buildQuickBooksCsv(rows)

  const safeName = tour.name.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
  const filename = `${safeName}-${format}.csv`

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
