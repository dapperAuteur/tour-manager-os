import { createHmac, timingSafeEqual } from 'node:crypto'

const SIG_VERSION = 'v1'

function getSecret(): string {
  const secret = process.env.TICKET_SIGNING_SECRET
  if (!secret) {
    throw new Error('TICKET_SIGNING_SECRET is not set')
  }
  if (secret.length < 32) {
    throw new Error('TICKET_SIGNING_SECRET must be at least 32 characters')
  }
  return secret
}

export interface SignedTicketPayload {
  id: string
  show_id: string
  issued_at: string
}

export function signTicket(payload: SignedTicketPayload): string {
  const secret = getSecret()
  const message = `${SIG_VERSION}|${payload.id}|${payload.show_id}|${payload.issued_at}`
  return createHmac('sha256', secret).update(message).digest('base64url')
}

export function verifyTicketSignature(
  payload: SignedTicketPayload,
  signature: string,
): boolean {
  let expected: string
  try {
    expected = signTicket(payload)
  } catch {
    return false
  }
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function buildQrPayload(payload: SignedTicketPayload, signature: string): string {
  return JSON.stringify({ v: SIG_VERSION, id: payload.id, sig: signature })
}

export interface ParsedQr {
  v: string
  id: string
  sig: string
}

export function parseQrPayload(raw: string): ParsedQr | null {
  try {
    const obj = JSON.parse(raw) as Partial<ParsedQr>
    if (
      typeof obj.v !== 'string' ||
      typeof obj.id !== 'string' ||
      typeof obj.sig !== 'string'
    ) {
      return null
    }
    return { v: obj.v, id: obj.id, sig: obj.sig }
  } catch {
    return null
  }
}
