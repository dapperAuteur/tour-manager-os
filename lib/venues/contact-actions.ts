'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = new Set([
  'booker',
  'production',
  'hospitality',
  'sound',
  'lighting',
  'merch',
  'security',
  'house',
  'other',
])

interface ParsedContact {
  role: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  isPrimary: boolean
}

function parseContact(form: FormData): ParsedContact | { error: string } {
  const role = (form.get('role') as string | null) || ''
  const name = ((form.get('name') as string | null) || '').trim()
  const phone = ((form.get('phone') as string | null) || '').trim()
  const email = ((form.get('email') as string | null) || '').trim()
  const notes = ((form.get('notes') as string | null) || '').trim()
  const isPrimary = form.get('is_primary') === 'on'

  if (!ALLOWED_ROLES.has(role)) return { error: 'Pick a role.' }
  if (!name) return { error: 'Name is required.' }
  if (name.length > 120) return { error: 'Name is too long (max 120 chars).' }
  if (!phone && !email) {
    return { error: 'Add at least a phone number or an email.' }
  }
  if (email && !email.includes('@')) {
    return { error: 'That email address looks wrong.' }
  }

  return {
    role,
    name,
    phone: phone || null,
    email: email || null,
    notes: notes || null,
    isPrimary,
  }
}

export async function createVenueContact(
  venueId: string,
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  const parsed = parseContact(formData)
  if ('error' in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // If marking primary, clear other primary flags for this venue+role.
  if (parsed.isPrimary) {
    await supabase
      .from('venue_contacts')
      .update({ is_primary: false })
      .eq('venue_id', venueId)
      .eq('role', parsed.role)
  }

  const { error } = await supabase.from('venue_contacts').insert({
    venue_id: venueId,
    role: parsed.role,
    name: parsed.name,
    phone: parsed.phone,
    email: parsed.email,
    notes: parsed.notes,
    is_primary: parsed.isPrimary,
  })
  if (error) return { error: error.message }

  revalidatePath(`/venues/${venueId}`)
  return { ok: true }
}

export async function updateVenueContact(
  venueId: string,
  contactId: string,
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  const parsed = parseContact(formData)
  if ('error' in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  if (parsed.isPrimary) {
    await supabase
      .from('venue_contacts')
      .update({ is_primary: false })
      .eq('venue_id', venueId)
      .eq('role', parsed.role)
      .neq('id', contactId)
  }

  const { data: updated, error } = await supabase
    .from('venue_contacts')
    .update({
      role: parsed.role,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      notes: parsed.notes,
      is_primary: parsed.isPrimary,
    })
    .eq('id', contactId)
    .eq('venue_id', venueId)
    .select('id')

  if (error) return { error: error.message }
  if (!updated || updated.length === 0) {
    return { error: 'Contact not found, or you don\'t have access.' }
  }

  revalidatePath(`/venues/${venueId}`)
  return { ok: true }
}

/**
 * Toggle the verified flag on a contact. When set, `verified_at` is now
 * and `verified_by` is the current user. When cleared, both are null.
 */
export async function setContactVerified(
  venueId: string,
  contactId: string,
  verified: boolean,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const patch = verified
    ? { verified_at: new Date().toISOString(), verified_by: user.id }
    : { verified_at: null, verified_by: null }

  const { error } = await supabase
    .from('venue_contacts')
    .update(patch)
    .eq('id', contactId)
    .eq('venue_id', venueId)

  if (error) return { error: error.message }
  revalidatePath(`/venues/${venueId}`)
  return { ok: true }
}

export async function deleteVenueContact(
  venueId: string,
  contactId: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { data: deleted, error } = await supabase
    .from('venue_contacts')
    .delete()
    .eq('id', contactId)
    .eq('venue_id', venueId)
    .select('id')

  if (error) return { error: error.message }
  if (!deleted || deleted.length === 0) {
    return { error: 'Not found or forbidden.' }
  }
  revalidatePath(`/venues/${venueId}`)
  return { ok: true }
}
