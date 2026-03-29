import { createClient } from '@/lib/supabase/server'

export async function getEmailLists(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_lists')
    .select('*, email_subscribers(count)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getEmailListWithSubscribers(listId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_lists')
    .select('*, email_subscribers(*)')
    .eq('id', listId)
    .single()

  if (error) throw error
  return data
}

export async function getCampaigns(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*, email_lists(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getMarketingDashboard(orgId: string) {
  const supabase = await createClient()

  const [listsRes, campaignsRes] = await Promise.all([
    supabase.from('email_lists').select('*, email_subscribers(count)').eq('org_id', orgId),
    supabase.from('email_campaigns').select('*').eq('org_id', orgId),
  ])

  const lists = listsRes.data || []
  const campaigns = campaignsRes.data || []

  const totalSubscribers = lists.reduce((sum, l) => {
    const count = Array.isArray(l.email_subscribers) ? l.email_subscribers.length : 0
    return sum + count
  }, 0)

  return {
    lists,
    campaigns,
    totalSubscribers,
    totalLists: lists.length,
    totalCampaigns: campaigns.length,
    sentCampaigns: campaigns.filter((c) => c.status === 'sent').length,
  }
}
