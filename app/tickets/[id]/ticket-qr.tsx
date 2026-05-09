'use client'

import { QRCodeSVG } from 'qrcode.react'

interface TicketQrProps {
  payload: string
}

export function TicketQr({ payload }: TicketQrProps) {
  return (
    <div
      className="rounded-lg bg-white p-4"
      aria-label="Ticket QR code"
      role="img"
    >
      <QRCodeSVG value={payload} size={224} level="M" />
    </div>
  )
}
