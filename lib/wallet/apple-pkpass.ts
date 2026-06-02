import { logError } from '@/lib/observability/logger'

export interface TicketPassInput {
  ticketId: string
  signature: string
  showId: string
  showDate: string
  showTime: string | null
  artistName: string
  venueName: string
  venueAddress: string | null
  ticketTypeName: string
  purchaserName: string | null
  purchaserEmail: string | null
  scanUrl: string
}

export function isApplePkpassConfigured(): boolean {
  return !!(
    process.env.PKPASS_CERT_PEM &&
    process.env.PKPASS_KEY_PEM &&
    process.env.PKPASS_WWDR_PEM &&
    process.env.PKPASS_PASS_TYPE_ID &&
    process.env.PKPASS_TEAM_ID
  )
}

/**
 * Builds a signed Apple Wallet pass (.pkpass) for one ticket.
 *
 * Operator setup (see plans/user-tasks/33-apple-wallet-cert.md):
 *   - Buy + install Pass Type ID cert from Apple Developer.
 *   - Export the cert as PEM + the key as PEM.
 *   - Download Apple WWDR G4 cert.
 *   - Set PKPASS_CERT_PEM / PKPASS_KEY_PEM / PKPASS_WWDR_PEM /
 *     PKPASS_PASS_TYPE_ID / PKPASS_TEAM_ID env vars.
 *   - Optionally PKPASS_KEY_PASSPHRASE.
 *
 * Until those env vars are set the function throws — the API route
 * handles the throw and returns a 503 telling the requester the
 * platform admin still needs to provision the cert.
 */
export async function buildTicketPkpass(
  ticket: TicketPassInput,
): Promise<Buffer> {
  if (!isApplePkpassConfigured()) {
    throw new Error(
      'Apple Wallet not configured — set PKPASS_CERT_PEM, PKPASS_KEY_PEM, PKPASS_WWDR_PEM, PKPASS_PASS_TYPE_ID, PKPASS_TEAM_ID.',
    )
  }

  const { PKPass } = await import('passkit-generator')

  const passTypeIdentifier = process.env.PKPASS_PASS_TYPE_ID!
  const teamIdentifier = process.env.PKPASS_TEAM_ID!

  // 1x1 transparent PNG fallback so a Pass can be built without a
  // band-specific icon. Override per org by uploading a logo to the
  // org branding settings — wiring that into here is a follow-up.
  const transparentPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  const tinyPng = Buffer.from(transparentPngBase64, 'base64')

  try {
    const pass = new PKPass(
      {
        'icon.png': tinyPng,
        'icon@2x.png': tinyPng,
      },
      {
        wwdr: process.env.PKPASS_WWDR_PEM!,
        signerCert: process.env.PKPASS_CERT_PEM!,
        signerKey: process.env.PKPASS_KEY_PEM!,
        signerKeyPassphrase: process.env.PKPASS_KEY_PASSPHRASE,
      },
      {
        formatVersion: 1,
        passTypeIdentifier,
        teamIdentifier,
        organizationName: ticket.artistName,
        serialNumber: ticket.ticketId,
        description: `${ticket.artistName} — ${ticket.venueName}`,
        backgroundColor: 'rgb(15, 23, 42)',
        foregroundColor: 'rgb(255, 255, 255)',
        labelColor: 'rgb(148, 163, 184)',
      },
    )

    // Scanner reads the same JSON our /api/tickets/scan endpoint
    // expects from a QR; serialise as JSON so an offline scan works
    // the same as a camera scan. setBarcodes accepts the JSON string
    // and turns it into both legacy .barcode and modern .barcodes
    // entries on the pass.

    pass.type = 'eventTicket'
    pass.setBarcodes(
      JSON.stringify({
        v: 'v1',
        id: ticket.ticketId,
        sig: ticket.signature,
      }),
    )

    // Primary field: ticket type. Secondary: artist + venue. Auxiliary:
    // date / time. Header field on the right: a short ticket id for
    // door staff cross-reference.
    pass.primaryFields.push({
      key: 'ticket_type',
      label: 'Admission',
      value: ticket.ticketTypeName,
    })
    pass.secondaryFields.push({
      key: 'artist',
      label: 'Artist',
      value: ticket.artistName,
    })
    pass.secondaryFields.push({
      key: 'venue',
      label: 'Venue',
      value: ticket.venueName,
    })
    pass.auxiliaryFields.push({
      key: 'date',
      label: 'Date',
      value: ticket.showDate,
    })
    if (ticket.showTime) {
      pass.auxiliaryFields.push({
        key: 'time',
        label: 'Doors',
        value: ticket.showTime,
      })
    }
    pass.headerFields.push({
      key: 'ticket_id',
      label: 'Ref',
      value: ticket.ticketId.slice(0, 8) + '…',
    })
    pass.backFields.push({
      key: 'purchaser',
      label: 'Purchaser',
      value:
        [ticket.purchaserName, ticket.purchaserEmail]
          .filter(Boolean)
          .join(' — ') || 'Guest',
    })
    if (ticket.venueAddress) {
      pass.backFields.push({
        key: 'address',
        label: 'Address',
        value: ticket.venueAddress,
      })
    }
    pass.backFields.push({
      key: 'scan_url',
      label: 'Scan / web fallback',
      value: ticket.scanUrl,
    })

    return pass.getAsBuffer()
  } catch (err) {
    logError('wallet.pkpass.build_failed', err, {
      ticket_id: ticket.ticketId,
    })
    throw err
  }
}
