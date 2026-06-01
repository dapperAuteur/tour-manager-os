import { createClient } from '@/lib/supabase/server'

export interface CandidateContact {
  id: string
  name: string
  role: string
  venue_name: string
}

/**
 * Returns the user's most-recent contacts as candidates for picker UIs
 * (group membership, override selection, etc.). The picker filters
 * further client-side, so this just needs to be enough to be useful.
 */
export async function listCandidateContacts(
  limit = 100,
): Promise<CandidateContact[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('venue_contacts')
    .select('id, name, role, venue_profiles(name)')
    .order('is_primary', { ascending: false })
    .order('name')
    .limit(limit)
  if (error || !data) return []
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    venue_name:
      (row.venue_profiles as { name?: string } | null)?.name || 'Unknown venue',
  }))
}
