import { createClient } from '@/lib/supabase/server'

export async function getHelpArticles(search?: string) {
  const supabase = await createClient()

  if (search && search.trim()) {
    // Use fuzzy search RPC
    const { data, error } = await supabase.rpc('search_help_articles', { query: search.trim() })
    if (error) {
      // Fallback to ilike if RPC fails
      const { data: fallback } = await supabase
        .from('help_articles')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${search}%,content.ilike.%${search}%,category.ilike.%${search}%`)
        .order('sort_order', { ascending: true })
      return fallback || []
    }
    return data || []
  }

  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })

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
