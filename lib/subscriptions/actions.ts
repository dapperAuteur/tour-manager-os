'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createPromoCode(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const code = (formData.get('code') as string).toUpperCase().replace(/[^A-Z0-9]/g, '')
  const description = formData.get('description') as string
  const discountType = formData.get('discount_type') as string
  const discountValue = Number(formData.get('discount_value'))
  const appliesTo = formData.get('applies_to') as string
  const maxUses = formData.get('max_uses') as string
  const isLifetimeGrant = formData.get('is_lifetime_grant') === 'on'
  const expiresAt = formData.get('expires_at') as string

  if (!code || !discountValue) return { error: 'Code and discount value are required' }

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('promo_codes').insert({
    code,
    description: description || null,
    discount_type: discountType,
    discount_value: discountValue,
    applies_to: appliesTo || 'all',
    max_uses: maxUses ? parseInt(maxUses) : null,
    is_lifetime_grant: isLifetimeGrant,
    expires_at: expiresAt || null,
    created_by: user.id,
  })

  if (error) {
    if (error.code === '23505') return { error: 'This code already exists' }
    return { error: error.message }
  }

  revalidatePath('/admin/promos')
  redirect('/admin/subscriptions')
}

export async function togglePromoCode(promoId: string, active: boolean) {
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('promo_codes').update({ active }).eq('id', promoId)
  if (error) return { error: error.message }
  revalidatePath('/admin/subscriptions')
  return { success: true }
}
