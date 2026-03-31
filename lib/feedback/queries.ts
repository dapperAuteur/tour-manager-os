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

  try {
    let threadQuery = supabase
      .from('feedback_threads')
      .select('*')
      .order('updated_at', { ascending: false })

    if (search && search.trim()) {
      threadQuery = threadQuery.or(`subject.ilike.%${search}%,category.ilike.%${search}%`)
    }

    const { data: threads } = await threadQuery
    if (!threads || threads.length === 0) return []

    // Enrich with user display names
    const userIds = [...new Set(threads.map((t) => t.user_id))]
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .in('id', userIds)

    const profileMap = new Map((profiles || []).map((p) => [p.id, p.display_name]))

    return threads.map((t) => ({
      ...t,
      user_profiles: { display_name: profileMap.get(t.user_id) || null },
      feedback_messages: [],
    }))
  } catch {
    return []
  }
}

export async function getAdminThreadWithMessages(threadId: string) {
  const supabase = createAdminClient()

  const { data: thread, error } = await supabase
    .from('feedback_threads')
    .select('*')
    .eq('id', threadId)
    .single()

  if (error) throw error

  // Get user display name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', thread.user_id)
    .single()

  const { data: rawMessages } = await supabase
    .from('feedback_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  // Enrich messages with sender names
  const senderIds = [...new Set((rawMessages || []).map((m) => m.sender_id).filter(Boolean))]
  const { data: senderProfiles } = await supabase
    .from('user_profiles')
    .select('id, display_name')
    .in('id', senderIds.length > 0 ? senderIds : ['00000000-0000-0000-0000-000000000000'])

  const senderMap = new Map((senderProfiles || []).map((p) => [p.id, p.display_name]))

  const messages = (rawMessages || []).map((m) => ({
    ...m,
    user_profiles: { display_name: senderMap.get(m.sender_id) || null },
  }))

  return {
    thread: { ...thread, user_profiles: { display_name: profile?.display_name || null } },
    messages,
  }
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
