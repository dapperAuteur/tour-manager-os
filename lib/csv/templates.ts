export interface CsvTemplate {
  name: string
  filename: string
  description: string
  headers: string[]
  sampleRow: string[]
}

export const csvTemplates: CsvTemplate[] = [
  {
    name: 'Shows',
    filename: 'shows-template.csv',
    description: 'Import shows into a tour. Each row is one show date.',
    headers: ['Date', 'City', 'State', 'Country', 'Venue Name', 'Timezone'],
    sampleRow: ['2026-07-15', 'Atlanta', 'GA', 'US', 'The Fox Theatre', 'America/New_York'],
  },
  {
    name: 'Expenses',
    filename: 'expenses-template.csv',
    description: 'Import expenses for a tour. Categories: travel, hotel, per_diem, meals, equipment, crew, merch, marketing, insurance, other.',
    headers: ['Date', 'Category', 'Amount', 'Description', 'Tax Deductible (yes/no)'],
    sampleRow: ['2026-07-15', 'hotel', '189.00', 'Hampton Inn - 1 night', 'yes'],
  },
  {
    name: 'Contacts',
    filename: 'contacts-template.csv',
    description: 'Import contacts. Roles: promoter, production, catering, pr, sponsorship, security, sound, backline, other.',
    headers: ['Role', 'Company Name', 'Contact Name', 'Phone', 'Email', 'Address'],
    sampleRow: ['promoter', 'Live Nation', 'Angela Davis', '404-555-1001', 'angela@example.com', '123 Main St'],
  },
  {
    name: 'Equipment',
    filename: 'equipment-template.csv',
    description: 'Import equipment inventory. Categories: instrument, amplifier, microphone, cable, stand, monitor, di_box, effects, drum, keyboard, case, lighting, other.',
    headers: ['Name', 'Category', 'Description', 'Serial Number', 'Quantity', 'Condition', 'Travels With Band (yes/no)'],
    sampleRow: ['Fender Stratocaster', 'instrument', 'Sunburst, rosewood fretboard', 'US12345678', '1', 'good', 'yes'],
  },
  {
    name: 'Merch Products',
    filename: 'merch-products-template.csv',
    description: 'Import merch products. Categories: apparel, vinyl, cd, poster, accessory, bundle, other.',
    headers: ['Name', 'SKU', 'Category', 'Price', 'Cost Per Unit', 'Description'],
    sampleRow: ['Tour T-Shirt 2026', 'TSHIRT-BLK-2026', 'apparel', '35.00', '8.50', 'Black cotton tee with tour dates'],
  },
  {
    name: 'Email Subscribers',
    filename: 'subscribers-template.csv',
    description: 'Import email subscribers to a list.',
    headers: ['Email', 'Name', 'City'],
    sampleRow: ['fan@example.com', 'Jane Smith', 'Atlanta'],
  },
  {
    name: 'State Income',
    filename: 'state-income-template.csv',
    description: 'Import state income records for tax tracking.',
    headers: ['Performance Date', 'State', 'City', 'Venue Name', 'Gross Income', 'Tax Year'],
    sampleRow: ['2026-07-15', 'GA', 'Atlanta', 'The Fox Theatre', '12000.00', '2026'],
  },
]

export function generateTemplateCsv(template: CsvTemplate): string {
  const rows = [template.headers, template.sampleRow]
  return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
}
