/**
 * Builds QuickBooks and Xero compatible CSVs from tour expense rows.
 *
 * - **QuickBooks Online**: Banking → File Upload accepts a 4-column
 *   CSV (`Date, Description, Amount, Category`). Negative amounts =
 *   money out (expenses). We emit dates in MM/DD/YYYY because that's
 *   the QBO default for US locales.
 * - **Xero**: Manual journal CSV. We use the simplified bank-statement
 *   format (`*Date, Description, Reference, Spent, Received`). Spent
 *   carries the amount on expense rows; Received stays blank.
 *
 * Neither format is the proprietary binary `.qbo` / `.qfx`. Both
 * accountants we asked about prefer CSV imports for tour books.
 */

export interface ExpenseRow {
  date: string // YYYY-MM-DD
  amount: number
  category: string
  description: string | null
  show_id: string | null
  show_label?: string | null
}

const CATEGORY_TO_QB: Record<string, string> = {
  travel: 'Travel',
  hotel: 'Lodging',
  per_diem: 'Meals & Entertainment',
  meals: 'Meals & Entertainment',
  equipment: 'Tools & Equipment',
  crew: 'Contractors',
  merch: 'Cost of Goods Sold',
  marketing: 'Advertising & Marketing',
  insurance: 'Insurance',
  other: 'Other Business Expense',
}

const CATEGORY_TO_XERO_CODE: Record<string, string> = {
  travel: '420',
  hotel: '420',
  per_diem: '420',
  meals: '420',
  equipment: '710',
  crew: '478',
  merch: '500',
  marketing: '400',
  insurance: '433',
  other: '404',
}

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatDateForQuickBooks(iso: string): string {
  // QBO expects MM/DD/YYYY by default in US locale uploads.
  const d = new Date(iso + 'T00:00:00Z')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const yyyy = d.getUTCFullYear()
  return `${mm}/${dd}/${yyyy}`
}

function formatDateForXero(iso: string): string {
  // Xero accepts DD/MM/YYYY for AU/NZ/UK but YYYY-MM-DD also imports
  // cleanly when the org locale is US. Stick with ISO for safety.
  return iso
}

/**
 * QuickBooks Online "Banking" CSV format.
 *
 * Columns: Date, Description, Amount, Category
 * Convention: expenses are negative.
 */
export function buildQuickBooksCsv(rows: ExpenseRow[]): string {
  const header = ['Date', 'Description', 'Amount', 'Category'].join(',')
  const body = rows.map((r) => {
    const desc = [r.description, r.show_label].filter(Boolean).join(' — ')
    const amount = (-Math.abs(r.amount)).toFixed(2)
    const category = CATEGORY_TO_QB[r.category] || 'Other Business Expense'
    return [
      formatDateForQuickBooks(r.date),
      csvEscape(desc || r.category),
      amount,
      csvEscape(category),
    ].join(',')
  })
  return [header, ...body].join('\r\n')
}

/**
 * Xero bank-statement CSV.
 *
 * Columns: *Date, *Amount, Payee, Description, Reference, Account Code
 *
 * Xero asterisks the required fields. Amount is positive for spent
 * (Xero treats it as a withdrawal on a bank line).
 */
export function buildXeroCsv(rows: ExpenseRow[]): string {
  const header = [
    '*Date',
    '*Amount',
    'Payee',
    'Description',
    'Reference',
    'Account Code',
  ].join(',')
  const body = rows.map((r) => {
    const desc = r.description || r.category
    const ref = r.show_label || ''
    const code = CATEGORY_TO_XERO_CODE[r.category] || '404'
    return [
      formatDateForXero(r.date),
      (-Math.abs(r.amount)).toFixed(2),
      csvEscape(''), // Payee unknown — left blank for the accountant
      csvEscape(desc),
      csvEscape(ref),
      code,
    ].join(',')
  })
  return [header, ...body].join('\r\n')
}
