import { createClient } from '@/lib/supabase/server'

export interface ContactSearchHit {
  id: string
  venue_id: string
  venue_name: string
  role: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  is_primary: boolean
}

/**
 * Search every venue_contact the current user can see via RLS, returning
 * up to `limit` hits. Empty query returns the most-recently-added
 * contacts (so the page is useful even before the user types).
 *
 * Match strategy: case-insensitive ILIKE on name/phone/email/role.
 * The venue table is small enough that this is fine without trigram.
 */
export async function searchContacts(
  query: string,
  limit = 50,
): Promise<ContactSearchHit[]> {
  const supabase = await createClient()
  const q = query.trim()

  let req = supabase
    .from('venue_contacts')
    .select('id, venue_id, role, name, phone, email, notes, is_primary, venue_profiles(name)')
    .order('is_primary', { ascending: false })
    .order('name')
    .limit(limit)

  if (q.length > 0) {
    // Escape % and _ so user-typed wildcards aren't honored.
    const escaped = q.replace(/[%_]/g, (m) => `\\${m}`)
    const term = `%${escaped}%`
    req = req.or(
      `name.ilike.${term},phone.ilike.${term},email.ilike.${term},role.ilike.${term}`,
    )
  }

  const { data, error } = await req
  if (error) return []

  return (data || []).map((row) => {
    const venueName =
      (row.venue_profiles as { name?: string } | null)?.name || 'Unknown venue'
    return {
      id: row.id,
      venue_id: row.venue_id,
      venue_name: venueName,
      role: row.role,
      name: row.name,
      phone: row.phone,
      email: row.email,
      notes: row.notes,
      is_primary: row.is_primary,
    }
  })
}
