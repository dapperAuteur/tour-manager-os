import { createClient } from '@/lib/supabase/server'

export async function getHelpArticles(search?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('help_articles')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,category.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getHelpArticleBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) throw error
  return data
}

export async function getHelpCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('help_articles')
    .select('category')
    .eq('published', true)

  const categories = [...new Set((data || []).map((a) => a.category))]
  return categories
}
