import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildSettlementPdf } from '@/lib/finances/settlement-pdf'
import { gatherSettlement } from '@/lib/finances/settlement-queries'

/**
 * GET /api/tours/[id]/settlement-pdf
 *
 * Builds a one-page tour settlement PDF and streams it back. Auth:
 * any signed-in tour member can pull it. The numbers are read from
 * the tour's tour-member-RLS-protected tables.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: tourId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Tour membership gate.
  const { count: memberCount } = await supabase
    .from('tour_members')
    .select('*', { count: 'exact', head: true })
    .eq('tour_id', tourId)
    .eq('user_id', user.id)
  if (!memberCount) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const data = await gatherSettlement(tourId)
  if (!data) {
    return NextResponse.json({ error: 'tour not found' }, { status: 404 })
  }

  const pdfBytes = await buildSettlementPdf(data)
  const safeName = (data.tourName || 'tour')
    .replace(/[^a-z0-9-]+/gi, '-')
    .toLowerCase()
  return new Response(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName}-settlement.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
