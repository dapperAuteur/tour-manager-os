import { createSign } from 'node:crypto'

export interface GoogleTicketInput {
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
}

export function isGoogleWalletConfigured(): boolean {
  return !!(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY &&
    process.env.GOOGLE_WALLET_CLASS_ID
  )
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8')
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

interface GoogleEventTicketObject {
  id: string
  classId: string
  state: 'ACTIVE'
  heroImage?: { sourceUri: { uri: string } }
  eventName: { defaultValue: { language: string; value: string } }
  venue?: {
    name: { defaultValue: { language: string; value: string } }
    address?: { defaultValue: { language: string; value: string } }
  }
  ticketType?: { defaultValue: { language: string; value: string } }
  ticketHolderName?: string
  dateTime?: { start: string }
  barcode: { type: 'QR_CODE'; value: string }
}

function buildEventTicketObject(
  ticket: GoogleTicketInput,
): GoogleEventTicketObject {
  const issuer = process.env.GOOGLE_WALLET_ISSUER_ID!
  const classId = process.env.GOOGLE_WALLET_CLASS_ID!
  const objectId = `${issuer}.tmos-${ticket.ticketId.replace(/-/g, '')}`

  // Same JSON the camera scanner reads from an in-app QR. Wallet and
  // in-app QRs are interchangeable at the door.
  const barcodeValue = JSON.stringify({
    v: 'v1',
    id: ticket.ticketId,
    sig: ticket.signature,
  })

  const startIso = ticket.showTime
    ? `${ticket.showDate}T${ticket.showTime}:00`
    : ticket.showDate

  const obj: GoogleEventTicketObject = {
    id: objectId,
    classId,
    state: 'ACTIVE',
    eventName: {
      defaultValue: { language: 'en-US', value: ticket.artistName },
    },
    barcode: { type: 'QR_CODE', value: barcodeValue },
  }
  if (ticket.venueName) {
    obj.venue = {
      name: { defaultValue: { language: 'en-US', value: ticket.venueName } },
    }
    if (ticket.venueAddress) {
      obj.venue.address = {
        defaultValue: { language: 'en-US', value: ticket.venueAddress },
      }
    }
  }
  if (ticket.ticketTypeName) {
    obj.ticketType = {
      defaultValue: { language: 'en-US', value: ticket.ticketTypeName },
    }
  }
  if (ticket.purchaserName) {
    obj.ticketHolderName = ticket.purchaserName
  }
  if (startIso) {
    obj.dateTime = { start: startIso }
  }
  return obj
}

/**
 * Builds the Save-to-Google-Wallet URL for one ticket. The user
 * opens this URL and Google shows the standard "Add to Wallet"
 * prompt.
 *
 * Throws when the four Google Wallet env vars are not set. The
 * route handler turns that into a 503 with a friendly message.
 */
export function buildGoogleWalletSaveUrl(ticket: GoogleTicketInput): string {
  if (!isGoogleWalletConfigured()) {
    throw new Error(
      'Google Wallet not configured. Set GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL, GOOGLE_WALLET_SERVICE_ACCOUNT_KEY, and GOOGLE_WALLET_CLASS_ID.',
    )
  }
  const issuerEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL!
  const privateKey = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY!.replace(
    /\\n/g,
    '\n',
  )
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://tour.witus.online'

  const ticketObject = buildEventTicketObject(ticket)
  const claims = {
    iss: issuerEmail,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [origin],
    payload: {
      eventTicketObjects: [ticketObject],
    },
  }

  const header = { alg: 'RS256', typ: 'JWT' }
  const headerPart = base64UrlEncode(JSON.stringify(header))
  const payloadPart = base64UrlEncode(JSON.stringify(claims))
  const signingInput = `${headerPart}.${payloadPart}`

  const signer = createSign('RSA-SHA256')
  signer.update(signingInput)
  signer.end()
  const signature = signer.sign(privateKey)
  const signaturePart = base64UrlEncode(signature)

  const jwt = `${signingInput}.${signaturePart}`
  return `https://pay.google.com/gp/v/save/${jwt}`
}
