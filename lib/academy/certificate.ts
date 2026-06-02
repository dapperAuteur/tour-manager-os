import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export interface CertificateData {
  recipientName: string
  courseTitle: string
  completedAt: Date
  /** Stable certificate id — usually the user_course_progress row id. */
  verificationId: string
}

/**
 * Renders a landscape A4 PDF certificate. Pure pdf-lib — no native deps,
 * no system fonts, no remote calls. Layout is deliberately simple so
 * the band can hand it to a tour manager who frames it without it
 * looking AI-generated.
 */
export async function buildCertificatePdf(
  data: CertificateData,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([842, 595]) // A4 landscape, points

  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
  const helveticaOblique = await pdf.embedFont(StandardFonts.HelveticaOblique)

  const { width, height } = page.getSize()
  const inkPrimary = rgb(0.08, 0.13, 0.31)
  const inkAccent = rgb(0.0, 0.4, 0.8)
  const inkMuted = rgb(0.35, 0.36, 0.42)

  // Double border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: inkPrimary,
    borderWidth: 2,
  })
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: inkAccent,
    borderWidth: 0.75,
  })

  // Header
  drawCenteredText(page, 'Tour Manager OS Academy', {
    y: height - 90,
    size: 14,
    font: helvetica,
    color: inkMuted,
    width,
  })
  drawCenteredText(page, 'Certificate of Completion', {
    y: height - 145,
    size: 32,
    font: helveticaBold,
    color: inkPrimary,
    width,
  })

  // Recipient
  drawCenteredText(page, 'This certifies that', {
    y: height - 215,
    size: 12,
    font: helveticaOblique,
    color: inkMuted,
    width,
  })
  drawCenteredText(page, data.recipientName, {
    y: height - 260,
    size: 28,
    font: helveticaBold,
    color: inkPrimary,
    width,
  })

  // Course
  drawCenteredText(page, 'has successfully completed the course', {
    y: height - 305,
    size: 12,
    font: helveticaOblique,
    color: inkMuted,
    width,
  })
  drawCenteredText(page, data.courseTitle, {
    y: height - 350,
    size: 22,
    font: helveticaBold,
    color: inkAccent,
    width,
  })

  // Date + verification footer
  const dateStr = data.completedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  drawCenteredText(page, `Completed ${dateStr}`, {
    y: 130,
    size: 12,
    font: helvetica,
    color: inkMuted,
    width,
  })

  // Verification footer (small, bottom-left)
  page.drawText(`Verification ID: ${data.verificationId}`, {
    x: 56,
    y: 56,
    size: 8,
    font: helvetica,
    color: inkMuted,
  })
  page.drawText('tour.witus.online/academy', {
    x: width - 220,
    y: 56,
    size: 8,
    font: helvetica,
    color: inkMuted,
  })

  return pdf.save()
}

function drawCenteredText(
  page: ReturnType<PDFDocument['addPage']>,
  text: string,
  opts: {
    y: number
    size: number
    font: Awaited<ReturnType<PDFDocument['embedFont']>>
    color: ReturnType<typeof rgb>
    width: number
  },
) {
  const textWidth = opts.font.widthOfTextAtSize(text, opts.size)
  page.drawText(text, {
    x: (opts.width - textWidth) / 2,
    y: opts.y,
    size: opts.size,
    font: opts.font,
    color: opts.color,
  })
}
