import { createClient } from '@/lib/supabase/server'

export interface ShowContactRow {
  contact_id: string
  role_override: string | null
  note: string | null
  /** Pulled from venue_contacts so we don't N+1 on the show page. */
  contact: {
    id: string
    name: string
    phone: string | null
    email: string | null
    role: string
    venue_id: string
  } | null
}

export async function listShowContacts(
  showId: string,
): Promise<ShowContactRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('show_contacts')
    .select('contact_id, role_override, note, venue_contacts(id, name, phone, email, role, venue_id)')
    .eq('show_id', showId)
  if (error || !data) return []
  return data.map((row) => ({
    contact_id: row.contact_id,
    role_override: row.role_override,
    note: row.note,
    contact: (row.venue_contacts as unknown as ShowContactRow['contact']) ?? null,
  }))
}

/**
 * Returns the contact list that should display on the show page.
 * If there are override rows, return those (with role_override and
 * note merged in). If none, fall back to ALL of the venue's contacts
 * — the current default behavior.
 */
export async function getEffectiveShowContacts(
  showId: string,
  venueId: string | null,
): Promise<{
  source: 'override' | 'venue'
  contacts: {
    id: string
    name: string
    phone: string | null
    email: string | null
    role: string
    note: string | null
  }[]
}> {
  const overrides = await listShowContacts(showId)
  if (overrides.length > 0) {
    return {
      source: 'override',
      contacts: overrides
        .filter((o) => o.contact !== null)
        .map((o) => ({
          id: o.contact!.id,
          name: o.contact!.name,
          phone: o.contact!.phone,
          email: o.contact!.email,
          role: o.role_override || o.contact!.role,
          note: o.note,
        })),
    }
  }

  if (!venueId) return { source: 'venue', contacts: [] }
  const supabase = await createClient()
  const { data } = await supabase
    .from('venue_contacts')
    .select('id, name, phone, email, role')
    .eq('venue_id', venueId)
    .order('is_primary', { ascending: false })
    .order('role')
    .order('name')
  return {
    source: 'venue',
    contacts: (data || []).map((row) => ({ ...row, note: null })),
  }
}
