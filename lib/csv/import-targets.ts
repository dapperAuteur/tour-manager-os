/**
 * Schema definitions for each CSV import target. The wizard uses
 * this list to render the column-mapping UI: for each `field`, the
 * user picks which CSV column maps to it.
 *
 * `requiresTour` means the wizard will ask the user to pick a tour
 * before mapping columns (shows + expenses both attach to a tour).
 */

export interface ImportField {
  key: string
  label: string
  required: boolean
  hint?: string
}

export interface ImportTarget {
  id: 'shows' | 'expenses' | 'contacts'
  name: string
  description: string
  templateFilename: string
  requiresTour: boolean
  fields: ImportField[]
}

export const importTargets: ImportTarget[] = [
  {
    id: 'shows',
    name: 'Shows',
    description: 'Bulk-add shows to a tour. Each row is one show date.',
    templateFilename: 'shows-template.csv',
    requiresTour: true,
    fields: [
      { key: 'show_date', label: 'Date', required: true, hint: 'YYYY-MM-DD' },
      { key: 'city', label: 'City', required: false },
      { key: 'state', label: 'State', required: false },
      { key: 'country', label: 'Country', required: false, hint: 'Defaults to "US" if blank' },
      { key: 'venue_name', label: 'Venue Name', required: false },
      { key: 'timezone', label: 'Timezone', required: false, hint: 'IANA name like America/New_York' },
    ],
  },
  {
    id: 'expenses',
    name: 'Expenses',
    description: 'Import expense lines into a tour\'s finances.',
    templateFilename: 'expenses-template.csv',
    requiresTour: true,
    fields: [
      { key: 'date', label: 'Date', required: true, hint: 'YYYY-MM-DD' },
      { key: 'category', label: 'Category', required: true, hint: 'travel, hotel, per_diem, meals, equipment, crew, merch, marketing, insurance, other' },
      { key: 'amount', label: 'Amount (USD)', required: true, hint: 'Numeric, no currency symbol' },
      { key: 'description', label: 'Description', required: false },
      { key: 'tax_deductible', label: 'Tax Deductible', required: false, hint: 'yes/no, true/false, 1/0' },
    ],
  },
  {
    id: 'contacts',
    name: 'Venue Contacts',
    description: 'Import contacts (booker, production, hospitality, etc.) attached to a specific venue.',
    templateFilename: 'contacts-template.csv',
    requiresTour: false,
    fields: [
      { key: 'role', label: 'Role', required: true, hint: 'booker, production, hospitality, sound, lighting, merch, security, house, other' },
      { key: 'name', label: 'Name', required: true },
      { key: 'phone', label: 'Phone', required: false, hint: 'Phone or email is required' },
      { key: 'email', label: 'Email', required: false, hint: 'Phone or email is required' },
      { key: 'notes', label: 'Notes', required: false },
    ],
  },
]

export function getImportTarget(id: string): ImportTarget | undefined {
  return importTargets.find((t) => t.id === id)
}
