'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateBranding(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('organizations')
    .update({
      brand_name: (formData.get('brand_name') as string) || null,
      brand_tagline: (formData.get('brand_tagline') as string) || null,
      brand_logo_url: (formData.get('brand_logo_url') as string) || null,
      brand_favicon_url: (formData.get('brand_favicon_url') as string) || null,
      brand_primary_color: (formData.get('brand_primary_color') as string) || '#4553ea',
      brand_font: (formData.get('brand_font') as string) || 'Inter',
      custom_css: (formData.get('custom_css') as string) || null,
      white_label_enabled: formData.get('white_label_enabled') === 'on',
    })
    .eq('id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/admin/white-label')
  return { success: true }
}

export async function addCustomDomain(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const domain = formData.get('domain') as string
  if (!domain) return { error: 'Domain is required' }

  const verificationToken = `tour-manager-verify-${crypto.randomUUID().slice(0, 12)}`

  const { error } = await supabase.from('custom_domains').insert({
    org_id: orgId,
    domain: domain.toLowerCase().trim(),
    verification_token: verificationToken,
  })

  if (error) {
    if (error.code === '23505') return { error: 'This domain is already registered' }
    return { error: error.message }
  }

  revalidatePath('/admin/white-label')
  return { success: true, verificationToken }
}

export async function removeDomain(domainId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('custom_domains').delete().eq('id', domainId)
  if (error) return { error: error.message }
  revalidatePath('/admin/white-label')
  return { success: true }
}
