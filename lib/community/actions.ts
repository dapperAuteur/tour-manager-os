'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPost(categoryId: string, categorySlug: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  if (!title || !content) return { error: 'Title and content are required' }

  const { error } = await supabase.from('community_posts').insert({
    category_id: categoryId,
    author_id: user.id,
    title,
    content,
  })

  if (error) return { error: error.message }
  revalidatePath(`/community/${categorySlug}`)
  redirect(`/community/${categorySlug}`)
}

export async function createReply(postId: string, categorySlug: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  if (!content) return { error: 'Reply content is required' }

  const { error } = await supabase.from('community_replies').insert({
    post_id: postId,
    author_id: user.id,
    content,
  })

  if (error) return { error: error.message }
  revalidatePath(`/community/${categorySlug}`)
  return { success: true }
}

export async function createCategory(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  if (!name) return { error: 'Name is required' }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const { error } = await supabase.from('community_categories').insert({
    org_id: orgId,
    name,
    description: description || null,
    slug,
  })

  if (error) return { error: error.message }
  revalidatePath('/community')
  return { success: true }
}

export async function togglePinPost(postId: string, pinned: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('community_posts').update({ pinned }).eq('id', postId)
  if (error) return { error: error.message }
  revalidatePath('/community')
  return { success: true }
}
