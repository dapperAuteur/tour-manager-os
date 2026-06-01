import { createClient } from '@/lib/supabase/server'

export interface ContactHistoryEntry {
  /** Other venue where the same person (matched by email or phone) appears. */
  venue_id: string
  venue_name: string
  /** Their role at that venue (lets us spot a job change). */
  role: string
  /** When that contact row was created — closest thing we have to a "last seen" timestamp. */
  created_at: string
}

/**
 * For a list of contacts at one venue, find every OTHER venue where the
 * same person (matched on case-insensitive email or normalized phone)
 * also has a contact row.
 *
 * Returns a map keyed by the input contact id. Empty map means no
 * cross-venue matches — common, since most contacts are venue-local.
 *
 * Why no new tables: the band wants "this person is now at venue X"
 * without us building a `people` registry. Normalizing on email/phone
 * is the cheapest proxy.
 */
export async function getContactHistory(
  contacts: { id: string; email: string | null; phone: string | null }[],
  excludeVenueId: string,
): Promise<Map<string, ContactHistoryEntry[]>> {
  const result = new Map<string, ContactHistoryEntry[]>()
  if (contacts.length === 0) return result

  const emails = contacts
    .map((c) => c.email?.trim().toLowerCase())
    .filter((e): e is string => !!e)
  const phones = contacts
    .map((c) => normalizePhone(c.phone))
    .filter((p): p is string => !!p && p.length >= 7)

  if (emails.length === 0 && phones.length === 0) return result

  const supabase = await createClient()

  // Fetch all candidate matches in one round-trip.
  const orParts: string[] = []
  if (emails.length > 0) {
    // ilike is case-insensitive — Supabase emails were stored as-typed.
    orParts.push(`email.in.(${quoteList(emails)})`)
  }
  if (phones.length > 0) {
    // Phones aren't normalized in storage, so we widen with ilike on the
    // last 7 digits of each candidate (good enough to catch formatting
    // variants like "317-965-0299" vs "(317) 965-0299").
    const phoneOrs = phones
      .map((p) => `phone.ilike.%${p.slice(-7)}%`)
      .join(',')
    orParts.push(phoneOrs)
  }

  const { data, error } = await supabase
    .from('venue_contacts')
    .select('id, venue_id, role, email, phone, created_at, venue_profiles(name)')
    .neq('venue_id', excludeVenueId)
    .or(orParts.join(','))
    .limit(200)

  if (error) return result

  // Bucket matches by which input contact they belong to.
  for (const inputContact of contacts) {
    const inputEmail = inputContact.email?.trim().toLowerCase() || null
    const inputPhoneTail = normalizePhone(inputContact.phone)?.slice(-7) || null
    const matches: ContactHistoryEntry[] = []

    for (const row of data || []) {
      const rowEmail = row.email?.trim().toLowerCase() || null
      const rowPhoneTail = normalizePhone(row.phone)?.slice(-7) || null
      const isEmailMatch = inputEmail && rowEmail && inputEmail === rowEmail
      const isPhoneMatch =
        inputPhoneTail && rowPhoneTail && inputPhoneTail === rowPhoneTail

      if (!isEmailMatch && !isPhoneMatch) continue

      const venueName =
        (row.venue_profiles as { name?: string } | null)?.name || 'Unknown venue'
      matches.push({
        venue_id: row.venue_id,
        venue_name: venueName,
        role: row.role,
        created_at: row.created_at as string,
      })
    }

    if (matches.length > 0) {
      // Sort newest first so "now at" reads correctly.
      matches.sort((a, b) => b.created_at.localeCompare(a.created_at))
      result.set(inputContact.id, matches)
    }
  }

  return result
}

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits.length > 0 ? digits : null
}

function quoteList(values: string[]): string {
  return values.map((v) => `"${v.replace(/"/g, '\\"')}"`).join(',')
}
