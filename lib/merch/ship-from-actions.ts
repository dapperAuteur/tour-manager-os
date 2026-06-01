'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

export async function updateShipFromAddress(formData: FormData): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // Resolve the user's org via membership.
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .limit(1)
    .maybeSingle()
  if (!membership?.org_id) {
    return { error: 'Org owner or admin only.' }
  }

  const get = (k: string) =>
    ((formData.get(k) as string | null) || '').trim() || null

  const patch = {
    ship_from_name: get('name'),
    ship_from_line1: get('line1'),
    ship_from_line2: get('line2'),
    ship_from_city: get('city'),
    ship_from_state: get('state'),
    ship_from_postal_code: get('postal_code'),
    ship_from_country: get('country'),
    ship_from_phone: get('phone'),
  }
  // Require enough fields to actually quote a shipment.
  if (!patch.ship_from_line1 || !patch.ship_from_city || !patch.ship_from_postal_code || !patch.ship_from_country) {
    return {
      error:
        'Address, city, postal code, and country are required.',
    }
  }

  const { error } = await supabase
    .from('organizations')
    .update(patch)
    .eq('id', membership.org_id)
  if (error) return { error: error.message }
  revalidatePath('/settings/ship-from')
  return { ok: true }
}
