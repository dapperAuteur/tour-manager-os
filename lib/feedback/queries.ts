import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getUserFeedbackThreads(search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('feedback_threads')
    .select('*, feedback_messages(count)')
    .order('updated_at', { ascending: false })

  if (search && search.trim()) {
    query = query.or(`subject.ilike.%${search}%,category.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getThreadWithMessages(threadId: string) {
  const supabase = await createClient()
  const { data: thread, error } = await supabase
    .from('feedback_threads')
    .select('*')
    .eq('id', threadId)
    .single()

  if (error) throw error

  const { data: messages } = await supabase
    .from('feedback_messages')
    .select('*, user_profiles:sender_id(display_name)')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  return { thread, messages: messages || [] }
}

// Admin queries — bypass RLS
export async function getAllFeedbackThreads(search?: string) {
  const supabase = createAdminClient()

  if (search && search.trim()) {
    // Fuzzy search via RPC
    const { data: fuzzy } = await supabase.rpc('search_feedback_threads', { query: search.trim() })
    if (fuzzy && fuzzy.length > 0) {
      // Enrich with user profiles and message counts
      const ids = fuzzy.map((f: { id: string }) => f.id)
      const { data } = await supabase
        .from('feedback_threads')
        .select('*, user_profiles:user_id(display_name), feedback_messages(count)')
        .in('id', ids)
        .order('updated_at', { ascending: false })
      return data || []
    }
  }

  const { data, error } = await supabase
    .from('feedback_threads')
    .select('*, user_profiles:user_id(display_name), feedback_messages(count)')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAdminThreadWithMessages(threadId: string) {
  const supabase = createAdminClient()
  const { data: thread, error } = await supabase
    .from('feedback_threads')
    .select('*, user_profiles:user_id(display_name)')
    .eq('id', threadId)
    .single()

  if (error) throw error

  const { data: messages } = await supabase
    .from('feedback_messages')
    .select('*, user_profiles:sender_id(display_name)')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  return { thread, messages: messages || [] }
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('feedback_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('read', false)

  return count || 0
}
