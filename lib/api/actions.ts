'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateApiKey } from './auth'

export async function createApiKey(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const scopes = formData.getAll('scopes') as string[]

  if (!name) return { error: 'Name is required' }

  const { key, prefix, hash } = generateApiKey()

  const { error } = await supabase.from('api_keys').insert({
    org_id: orgId,
    name,
    key_prefix: prefix,
    key_hash: hash,
    scopes: scopes.length > 0 ? scopes : ['read'],
    created_by: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/api-keys')
  // Return the key only once — it can never be retrieved again
  return { success: true, key }
}

export async function revokeApiKey(keyId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('api_keys').update({ active: false }).eq('id', keyId)
  if (error) return { error: error.message }
  revalidatePath('/admin/api-keys')
  return { success: true }
}
