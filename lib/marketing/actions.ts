'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createEmailList(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) return { error: 'List name is required' }

  const { error } = await supabase.from('email_lists').insert({
    org_id: orgId,
    name,
    description: description || null,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/marketing')
  redirect('/marketing')
}

export async function addSubscriber(listId: string, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const city = formData.get('city') as string

  if (!email) return { error: 'Email is required' }

  const { error } = await supabase.from('email_subscribers').insert({
    list_id: listId,
    email,
    name: name || null,
    city: city || null,
    source: 'manual',
  })

  if (error) {
    if (error.code === '23505') return { error: 'This email is already on the list' }
    return { error: error.message }
  }

  revalidatePath('/marketing')
  return { success: true }
}

export async function createCampaign(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const subject = formData.get('subject') as string
  const content = formData.get('content') as string
  const listId = formData.get('list_id') as string
  const scheduledAt = formData.get('scheduled_at') as string

  if (!subject || !content) return { error: 'Subject and content are required' }

  const status = scheduledAt ? 'scheduled' : 'draft'

  const { error } = await supabase.from('email_campaigns').insert({
    org_id: orgId,
    list_id: listId || null,
    subject,
    content,
    status,
    scheduled_at: scheduledAt || null,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/marketing')
  redirect('/marketing')
}

export async function deleteCampaign(campaignId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('email_campaigns').delete().eq('id', campaignId)
  if (error) return { error: error.message }
  revalidatePath('/marketing')
  return { success: true }
}
