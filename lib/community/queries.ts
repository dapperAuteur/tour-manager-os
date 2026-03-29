import { createClient } from '@/lib/supabase/server'

export async function getCommunityCategories(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_categories')
    .select('*, community_posts(count)')
    .eq('org_id', orgId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getCategoryWithPosts(orgId: string, slug: string) {
  const supabase = await createClient()
  const { data: category, error } = await supabase
    .from('community_categories')
    .select('*')
    .eq('org_id', orgId)
    .eq('slug', slug)
    .single()

  if (error) throw error

  const { data: posts } = await supabase
    .from('community_posts')
    .select('*, community_replies(count), user_profiles:author_id(display_name)')
    .eq('category_id', category.id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return { category, posts: posts || [] }
}

export async function getPostWithReplies(postId: string) {
  const supabase = await createClient()
  const { data: post, error } = await supabase
    .from('community_posts')
    .select('*, user_profiles:author_id(display_name), community_categories(slug)')
    .eq('id', postId)
    .single()

  if (error) throw error

  const { data: replies } = await supabase
    .from('community_replies')
    .select('*, user_profiles:author_id(display_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  return { post, replies: replies || [] }
}
