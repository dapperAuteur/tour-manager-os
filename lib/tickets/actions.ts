'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_CATEGORIES = new Set([
  'general',
  'vip',
  'reserved',
  'comp',
])

interface ParsedInput {
  name: string
  category: string
  price: number
  quantityAvailable: number | null
  description: string | null
  active: boolean
}

function parseTicketTypeInput(form: FormData): ParsedInput | { error: string } {
  const name = (form.get('name') as string | null)?.trim() || ''
  const category = (form.get('category') as string | null) || ''
  const priceRaw = (form.get('price') as string | null) || ''
  const description = (form.get('description') as string | null)?.trim() || ''
  const unlimited = form.get('unlimited') === 'on'
  const quantityRaw = (form.get('quantity_available') as string | null) || ''
  const active = form.get('active') === 'on'

  if (!name) return { error: 'Name is required.' }
  if (name.length > 120) return { error: 'Name is too long (max 120 chars).' }
  if (!ALLOWED_CATEGORIES.has(category)) {
    return { error: 'Pick a category.' }
  }

  const price = Number.parseFloat(priceRaw)
  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Price must be a number (use 0 for comp tickets).' }
  }
  if (category === 'comp' && price !== 0) {
    return { error: 'Comp tickets must be priced at $0.' }
  }
  if (price > 0 && price < 0.5) {
    return { error: 'Price must be at least $0.50 (Stripe minimum) or exactly $0 for comps.' }
  }

  let quantityAvailable: number | null = null
  if (!unlimited) {
    const q = Number.parseInt(quantityRaw, 10)
    if (!Number.isFinite(q) || q < 1) {
      return { error: 'Quantity must be 1 or more, or check "Unlimited".' }
    }
    quantityAvailable = q
  }

  return {
    name,
    category,
    price,
    quantityAvailable,
    description: description || null,
    active,
  }
}

export async function createTicketType(
  tourId: string,
  showId: string,
  formData: FormData,
) {
  const parsed = parseTicketTypeInput(formData)
  if ('error' in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // RLS policy `ticket_types_staff_manage` enforces tour-staff
  // membership; non-staff inserts return 0 rows and we 404 below.
  const { error } = await supabase.from('ticket_types').insert({
    show_id: showId,
    name: parsed.name,
    category: parsed.category,
    price: parsed.price,
    quantity_available: parsed.quantityAvailable,
    description: parsed.description,
    active: parsed.active,
  })

  if (error) return { error: error.message }

  revalidatePath(`/tours/${tourId}/shows/${showId}/tickets`)
  revalidatePath(`/shows/${showId}/tickets`)
  redirect(`/tours/${tourId}/shows/${showId}/tickets`)
}

export async function updateTicketType(
  tourId: string,
  showId: string,
  ticketTypeId: string,
  formData: FormData,
) {
  const parsed = parseTicketTypeInput(formData)
  if ('error' in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { data: updated, error } = await supabase
    .from('ticket_types')
    .update({
      name: parsed.name,
      category: parsed.category,
      price: parsed.price,
      quantity_available: parsed.quantityAvailable,
      description: parsed.description,
      active: parsed.active,
    })
    .eq('id', ticketTypeId)
    .eq('show_id', showId)
    .select('id')

  if (error) return { error: error.message }
  if (!updated || updated.length === 0) {
    return { error: 'Ticket type not found, or you don\'t have access.' }
  }

  revalidatePath(`/tours/${tourId}/shows/${showId}/tickets`)
  revalidatePath(`/shows/${showId}/tickets`)
  redirect(`/tours/${tourId}/shows/${showId}/tickets`)
}

export async function setTicketTypeActive(
  tourId: string,
  showId: string,
  ticketTypeId: string,
  active: boolean,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { data: updated, error } = await supabase
    .from('ticket_types')
    .update({ active })
    .eq('id', ticketTypeId)
    .eq('show_id', showId)
    .select('id')

  if (error) return { error: error.message }
  if (!updated || updated.length === 0) {
    return { error: 'Not found or forbidden.' }
  }
  revalidatePath(`/tours/${tourId}/shows/${showId}/tickets`)
  revalidatePath(`/shows/${showId}/tickets`)
  return { ok: true }
}

export async function deleteTicketType(
  tourId: string,
  showId: string,
  ticketTypeId: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // Guard: can't delete a type that has issued tickets — we'd orphan
  // signed QRs. Caller should hide / soft-delete instead.
  const { count } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('ticket_type_id', ticketTypeId)
  if ((count ?? 0) > 0) {
    return {
      error:
        'This ticket type already has issued tickets and can\'t be deleted. Set it inactive to hide it instead.',
    }
  }

  const { data: deleted, error } = await supabase
    .from('ticket_types')
    .delete()
    .eq('id', ticketTypeId)
    .eq('show_id', showId)
    .select('id')

  if (error) return { error: error.message }
  if (!deleted || deleted.length === 0) {
    return { error: 'Not found or forbidden.' }
  }
  revalidatePath(`/tours/${tourId}/shows/${showId}/tickets`)
  revalidatePath(`/shows/${showId}/tickets`)
  return { ok: true }
}
