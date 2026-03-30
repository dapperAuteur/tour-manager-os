'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createBlogPost(orgId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const coverImageUrl = formData.get('cover_image_url') as string
  const videoUrl = formData.get('video_url') as string
  const audioUrl = formData.get('audio_url') as string
  const tags = formData.get('tags') as string
  const published = formData.get('published') === 'on'

  if (!title || !content) return { error: 'Title and content are required' }

  const slug = slugify(title) + '-' + Date.now().toString(36)

  const { error } = await supabase.from('blog_posts').insert({
    org_id: orgId,
    author_id: user.id,
    title,
    slug,
    content,
    excerpt: excerpt || null,
    cover_image_url: coverImageUrl || null,
    video_url: videoUrl || null,
    audio_url: audioUrl || null,
    tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    published,
  })

  if (error) return { error: error.message }
  revalidatePath('/blog')
  redirect('/blog')
}
