import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyTicketSignature, parseQrPayload } from '@/lib/tickets/sign'

interface ScanRequest {
  qr?: string
  id?: string
  sig?: string
  show_id: string
  device_id?: string
  /** ISO timestamp captured by the scanner when the QR was decoded
   * offline. Used as `used_at` instead of now() so the audit trail
   * reflects door reality, not network catch-up time. */
  offline_scanned_at?: string
}

type ScanResult = 'ok' | 'already_used' | 'invalid_sig' | 'wrong_show' | 'refunded' | 'void' | 'not_found'

function uuidLooksValid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

export async function POST(request: Request) {
  // Authn: only tour staff (manager/crew) for the show's tour can scan.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: ScanRequest
  try {
    body = (await request.json()) as ScanRequest
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const showId = body.show_id
  if (!showId || !uuidLooksValid(showId)) {
    return NextResponse.json({ error: 'show_id required' }, { status: 400 })
  }

  let id: string | undefined
  let sig: string | undefined
  if (body.qr) {
    const parsed = parseQrPayload(body.qr)
    if (parsed) {
      id = parsed.id
      sig = parsed.sig
    }
  }
  if (!id && body.id) id = body.id
  if (!sig && body.sig) sig = body.sig

  if (!id || !sig) {
    return NextResponse.json({ error: 'id and sig required' }, { status: 400 })
  }

  // Authz: verify the scanner is on staff for this show's tour.
  const admin = createAdminClient()
  const { count: staffCount, error: staffErr } = await admin
    .from('tour_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('role', ['manager', 'crew'])
    .in(
      'tour_id',
      (await admin.from('shows').select('tour_id').eq('id', showId)).data?.map(
        (s) => s.tour_id,
      ) || [],
    )
  if (staffErr || !staffCount) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const deviceId = body.device_id || null
  const offlineScannedAt = (() => {
    if (!body.offline_scanned_at) return null
    const t = new Date(body.offline_scanned_at).getTime()
    if (!Number.isFinite(t)) return null
    // Clamp to "not in the future" so a misconfigured device clock
    // can't shift the audit timeline forward.
    return new Date(Math.min(t, Date.now())).toISOString()
  })()

  async function logScan(
    ticketId: string | null,
    result: ScanResult,
    attemptedTicketId: string,
  ) {
    await admin.from('scan_logs').insert({
      ticket_id: ticketId,
      show_id: showId,
      scanned_by_user_id: user!.id,
      device_id: deviceId,
      result,
      attempted_ticket_id: attemptedTicketId,
      offline_scanned_at: offlineScannedAt,
      synced_from_offline: !!offlineScannedAt,
    })
  }

  if (!uuidLooksValid(id)) {
    await logScan(null, 'not_found', '00000000-0000-0000-0000-000000000000')
    return NextResponse.json({ result: 'not_found' satisfies ScanResult })
  }

  // Fetch the ticket — we need issued_at to recompute the HMAC and we
  // need to check show_id, status before mutating.
  const { data: ticket, error: tErr } = await admin
    .from('tickets')
    .select('id, show_id, issued_at, status, signature')
    .eq('id', id)
    .maybeSingle()

  if (tErr || !ticket) {
    await logScan(null, 'not_found', id)
    return NextResponse.json({ result: 'not_found' satisfies ScanResult })
  }

  if (
    !verifyTicketSignature(
      { id: ticket.id, show_id: ticket.show_id, issued_at: ticket.issued_at },
      sig,
    )
  ) {
    await logScan(ticket.id, 'invalid_sig', id)
    return NextResponse.json({ result: 'invalid_sig' satisfies ScanResult })
  }

  if (ticket.show_id !== showId) {
    await logScan(ticket.id, 'wrong_show', id)
    return NextResponse.json({ result: 'wrong_show' satisfies ScanResult })
  }

  if (ticket.status === 'refunded') {
    await logScan(ticket.id, 'refunded', id)
    return NextResponse.json({ result: 'refunded' satisfies ScanResult })
  }
  if (ticket.status === 'void') {
    await logScan(ticket.id, 'void', id)
    return NextResponse.json({ result: 'void' satisfies ScanResult })
  }

  // Atomic single-use update: only flips if status is currently 'issued'.
  // Concurrent scans race here; the loser sees 0 affected rows.
  const { data: updated, error: uErr } = await admin
    .from('tickets')
    .update({
      status: 'used',
      used_at: offlineScannedAt || new Date().toISOString(),
      scanned_by_user_id: user.id,
      scanned_device_id: deviceId,
    })
    .eq('id', ticket.id)
    .eq('status', 'issued')
    .select('id')

  if (uErr) {
    return NextResponse.json({ error: 'update failed' }, { status: 500 })
  }

  if (!updated || updated.length === 0) {
    await logScan(ticket.id, 'already_used', id)
    return NextResponse.json({ result: 'already_used' satisfies ScanResult })
  }

  await logScan(ticket.id, 'ok', id)
  return NextResponse.json({ result: 'ok' satisfies ScanResult, ticket_id: ticket.id })
}
