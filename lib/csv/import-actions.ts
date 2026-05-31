'use server'

import { createClient } from '@/lib/supabase/server'
import { getImportTarget } from './import-targets'

export interface ImportRowError {
  row: number
  message: string
}

export interface ImportResult {
  total: number
  imported: number
  skipped: number
  errors: ImportRowError[]
  importId?: string
}

interface RunImportParams {
  target: 'shows' | 'expenses' | 'contacts'
  /** Tour id (required for shows + expenses). */
  tourId?: string
  /** Venue id (required for contacts). */
  venueId?: string
  filename: string
  /** Rows already mapped: each row is an object keyed by ImportTarget.field.key. */
  rows: Record<string, string>[]
}

const EXPENSE_CATEGORIES = new Set([
  'travel', 'hotel', 'per_diem', 'meals', 'equipment',
  'crew', 'merch', 'marketing', 'insurance', 'other',
])
const CONTACT_ROLES = new Set([
  'booker', 'production', 'hospitality', 'sound', 'lighting',
  'merch', 'security', 'house', 'other',
])

function parseBool(v: string): boolean {
  const s = v.trim().toLowerCase()
  return s === 'yes' || s === 'true' || s === '1' || s === 'y'
}

function isIsoDate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v.trim())
}

export async function runCsvImport(params: RunImportParams): Promise<ImportResult> {
  const target = getImportTarget(params.target)
  if (!target) {
    return { total: 0, imported: 0, skipped: 0, errors: [{ row: 0, message: 'Unknown import target.' }] }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { total: 0, imported: 0, skipped: 0, errors: [{ row: 0, message: 'Not signed in.' }] }
  }

  // Resolve org via membership (first org).
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  const orgId = membership?.org_id ?? null

  const errors: ImportRowError[] = []
  let imported = 0
  let skipped = 0

  for (let i = 0; i < params.rows.length; i++) {
    const row = params.rows[i]
    const rowNumber = i + 2 // +1 for header, +1 because users count from 1
    try {
      // Validate required fields against the schema.
      for (const f of target.fields) {
        if (f.required && !row[f.key]) {
          throw new Error(`Missing required field "${f.label}"`)
        }
      }

      if (target.id === 'shows') {
        if (!params.tourId) throw new Error('No tour selected.')
        if (!isIsoDate(row.show_date)) throw new Error('Date must be YYYY-MM-DD.')
        if (!row.city) throw new Error('City is required.')
        const { error } = await supabase.from('shows').insert({
          tour_id: params.tourId,
          date: row.show_date,
          city: row.city,
          state: row.state || null,
          country: row.country || 'US',
          venue_name: row.venue_name || null,
          timezone: row.timezone || 'America/New_York',
          status: 'draft',
        })
        if (error) throw new Error(error.message)
      } else if (target.id === 'expenses') {
        if (!params.tourId) throw new Error('No tour selected.')
        if (!isIsoDate(row.date)) throw new Error('Date must be YYYY-MM-DD.')
        const cat = row.category.toLowerCase().replace(/\s+/g, '_').replace('-', '_')
        if (!EXPENSE_CATEGORIES.has(cat)) {
          throw new Error(`Category "${row.category}" is not one of: ${[...EXPENSE_CATEGORIES].join(', ')}`)
        }
        const amount = Number(row.amount.replace(/[^0-9.\-]/g, ''))
        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error(`Amount "${row.amount}" is not a positive number.`)
        }
        const { error } = await supabase.from('expenses').insert({
          tour_id: params.tourId,
          date: row.date,
          category: cat,
          amount,
          description: row.description || null,
          is_tax_deductible: row.tax_deductible ? parseBool(row.tax_deductible) : false,
          member_id: user.id,
        })
        if (error) throw new Error(error.message)
      } else if (target.id === 'contacts') {
        if (!params.venueId) throw new Error('No venue selected.')
        const role = row.role.toLowerCase().trim()
        if (!CONTACT_ROLES.has(role)) {
          throw new Error(`Role "${row.role}" is not one of: ${[...CONTACT_ROLES].join(', ')}`)
        }
        if (!row.phone && !row.email) {
          throw new Error('Phone or email is required.')
        }
        const { error } = await supabase.from('venue_contacts').insert({
          venue_id: params.venueId,
          role,
          name: row.name,
          phone: row.phone || null,
          email: row.email || null,
          notes: row.notes || null,
          is_primary: false,
        })
        if (error) throw new Error(error.message)
      }
      imported++
    } catch (err) {
      skipped++
      errors.push({
        row: rowNumber,
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  // Log the import attempt for history/auditing.
  const { data: logRow } = await supabase
    .from('csv_imports')
    .insert({
      user_id: user.id,
      org_id: orgId,
      target: target.id,
      tour_id: params.tourId ?? null,
      filename: params.filename,
      total_rows: params.rows.length,
      imported_rows: imported,
      skipped_rows: skipped,
      errors: errors.slice(0, 100), // cap to avoid blowing up the row
    })
    .select('id')
    .maybeSingle()

  return {
    total: params.rows.length,
    imported,
    skipped,
    errors,
    importId: logRow?.id,
  }
}

export async function listToursForImport(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('tours')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(50)
  return (data || []) as { id: string; name: string }[]
}

export async function listVenuesForImport(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('venue_profiles')
    .select('id, name')
    .order('name')
    .limit(200)
  return (data || []) as { id: string; name: string }[]
}
