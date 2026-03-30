import { createClient } from '@/lib/supabase/server'

export async function getBlogPosts(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, user_profiles:author_id(display_name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getBlogPost(orgId: string, slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, user_profiles:author_id(display_name)')
    .eq('org_id', orgId)
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}
