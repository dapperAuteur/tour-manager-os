import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'

export interface SettlementInput {
  tourName: string
  artistName: string
  startDate: string | null
  endDate: string | null
  showCount: number
  ticketsSold: number
  ticketRevenueCents: number
  merchRevenueCents: number
  guaranteesCents: number
  expensesByCategory: { category: string; cents: number }[]
  totalExpensesCents: number
  splits: { payee: string; role: string | null; percentBasisPoints: number; cents: number }[]
  transfers: { payee: string; cents: number; status: string }[]
  generatedAt: Date
}

const CATEGORY_LABELS: Record<string, string> = {
  travel: 'Travel',
  hotel: 'Hotel',
  per_diem: 'Per Diem',
  meals: 'Meals',
  equipment: 'Equipment',
  crew: 'Crew',
  merch: 'Merch',
  marketing: 'Marketing',
  insurance: 'Insurance',
  other: 'Other',
}

function fmtCents(cents: number): string {
  const dollars = Math.abs(cents) / 100
  const sign = cents < 0 ? '-' : ''
  return `${sign}$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pad(width: number, font: PDFFont, size: number, text: string, _align: 'left' | 'right' = 'left'): string {
  // pdf-lib does not auto-truncate. Hard cut overflow so the column
  // stays inside its band.
  const maxChars = Math.floor(width / (size * 0.55))
  if (text.length <= maxChars) return text
  return text.slice(0, Math.max(1, maxChars - 1)) + '…'
}

interface DrawContext {
  page: PDFPage
  cursorY: number
  bold: PDFFont
  reg: PDFFont
  width: number
}

function drawHeading(ctx: DrawContext, text: string, size = 14, color = rgb(0.05, 0.05, 0.05)): void {
  ctx.page.drawText(text, { x: 56, y: ctx.cursorY, size, font: ctx.bold, color })
  ctx.cursorY -= size + 6
}

function drawLine(ctx: DrawContext, gap = 8): void {
  ctx.page.drawLine({
    start: { x: 56, y: ctx.cursorY },
    end: { x: ctx.width - 56, y: ctx.cursorY },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.75),
  })
  ctx.cursorY -= gap
}

function drawRow(
  ctx: DrawContext,
  left: string,
  right: string,
  opts: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb> } = {},
): void {
  const size = opts.size ?? 11
  const font = opts.bold ? ctx.bold : ctx.reg
  const color = opts.color ?? rgb(0.2, 0.2, 0.22)
  ctx.page.drawText(pad(330, font, size, left), {
    x: 56,
    y: ctx.cursorY,
    size,
    font,
    color,
  })
  const rightText = pad(140, font, size, right, 'right')
  const w = font.widthOfTextAtSize(rightText, size)
  ctx.page.drawText(rightText, {
    x: ctx.width - 56 - w,
    y: ctx.cursorY,
    size,
    font,
    color,
  })
  ctx.cursorY -= size + 4
}

export async function buildSettlementPdf(input: SettlementInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([612, 792]) // US Letter portrait
  const reg = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const muted = rgb(0.45, 0.45, 0.5)

  const { width, height } = page.getSize()
  let cursorY = height - 56
  const ctx: DrawContext = { page, cursorY, bold, reg, width }

  // Header
  page.drawText('Tour Settlement', { x: 56, y: cursorY, size: 22, font: bold })
  cursorY -= 28
  page.drawText(input.tourName, { x: 56, y: cursorY, size: 14, font: bold })
  cursorY -= 18
  page.drawText(input.artistName, { x: 56, y: cursorY, size: 11, font: reg, color: muted })
  cursorY -= 14
  if (input.startDate && input.endDate) {
    page.drawText(`${input.startDate} to ${input.endDate}`, {
      x: 56, y: cursorY, size: 10, font: reg, color: muted,
    })
    cursorY -= 12
  }
  page.drawText(
    `${input.showCount} show${input.showCount === 1 ? '' : 's'}, ${input.ticketsSold} ticket${input.ticketsSold === 1 ? '' : 's'} sold.`,
    { x: 56, y: cursorY, size: 10, font: reg, color: muted },
  )
  cursorY -= 18
  ctx.cursorY = cursorY
  drawLine(ctx)

  // Revenue section
  drawHeading(ctx, 'Revenue')
  drawRow(ctx, 'Ticket sales', fmtCents(input.ticketRevenueCents))
  drawRow(ctx, 'Merch sales', fmtCents(input.merchRevenueCents))
  drawRow(ctx, 'Guarantees', fmtCents(input.guaranteesCents))
  const revenueTotal =
    input.ticketRevenueCents + input.merchRevenueCents + input.guaranteesCents
  drawLine(ctx)
  drawRow(ctx, 'Total revenue', fmtCents(revenueTotal), { bold: true, size: 12 })
  ctx.cursorY -= 4

  // Expenses
  drawHeading(ctx, 'Expenses')
  if (input.expensesByCategory.length === 0) {
    drawRow(ctx, 'No expenses recorded.', '', { color: muted })
  } else {
    for (const row of input.expensesByCategory) {
      drawRow(ctx, CATEGORY_LABELS[row.category] || row.category, fmtCents(row.cents))
    }
  }
  drawLine(ctx)
  drawRow(ctx, 'Total expenses', fmtCents(input.totalExpensesCents), { bold: true, size: 12 })
  ctx.cursorY -= 4

  // Net
  drawHeading(ctx, 'Net to the tour', 13)
  const net = revenueTotal - input.totalExpensesCents
  drawRow(ctx, 'Revenue minus expenses', fmtCents(net), {
    bold: true,
    size: 14,
    color: net >= 0 ? rgb(0.05, 0.45, 0.2) : rgb(0.6, 0.1, 0.1),
  })
  ctx.cursorY -= 6

  // Splits + transfers
  if (input.splits.length > 0) {
    drawHeading(ctx, 'Revenue splits')
    for (const s of input.splits) {
      const label = `${s.payee}${s.role ? ` (${s.role})` : ''} at ${(s.percentBasisPoints / 100).toFixed(2)}%`
      drawRow(ctx, label, fmtCents(s.cents))
    }
    ctx.cursorY -= 2
  }

  if (input.transfers.length > 0) {
    drawHeading(ctx, 'Stripe transfers routed')
    for (const t of input.transfers) {
      const label = `${t.payee} (${t.status})`
      drawRow(ctx, label, fmtCents(t.cents))
    }
    ctx.cursorY -= 2
  }

  // Footer
  page.drawText(
    `Generated ${input.generatedAt.toISOString().slice(0, 10)} by Tour Manager OS`,
    { x: 56, y: 36, size: 9, font: reg, color: muted },
  )

  return pdf.save()
}
