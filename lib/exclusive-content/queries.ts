import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface ExclusivePiece {
  id: string
  show_id: string
  org_id: string
  phase: 'pre' | 'post'
  unlock_offset_hours: number
  title: string
  body: string | null
  media_url: string | null
  call_to_action_label: string | null
  call_to_action_url: string | null
  active: boolean
  created_at: string
}

export async function listExclusiveForShow(
  showId: string,
): Promise<ExclusivePiece[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('show_exclusive_content')
    .select('*')
    .eq('show_id', showId)
    .order('phase')
    .order('unlock_offset_hours')
  return (data || []) as ExclusivePiece[]
}

/**
 * Returns the pre/post pieces for a show that are currently in their
 * unlock window. Used by the public unlock endpoint; the show.date is
 * treated as midnight in the venue's local time, and the offset is
 * applied from there. Crude but accurate enough for the "is the doors
 * window open?" question.
 */
export async function listUnlockedForShow(
  showId: string,
): Promise<ExclusivePiece[]> {
  const admin = createAdminClient()
  const { data: show } = await admin
    .from('shows')
    .select('id, date')
    .eq('id', showId)
    .maybeSingle()
  if (!show) return []

  const { data: pieces } = await admin
    .from('show_exclusive_content')
    .select('*')
    .eq('show_id', showId)
    .eq('active', true)
  if (!pieces) return []

  const now = Date.now()
  const showMidnight = new Date(`${show.date}T00:00:00Z`).getTime()

  return (pieces as ExclusivePiece[]).filter((p) => {
    const unlockAt = showMidnight + p.unlock_offset_hours * 60 * 60 * 1000
    if (p.phase === 'pre') {
      // Pre-show content is unlocked from its offset until midnight on
      // show day.
      return now >= unlockAt && now < showMidnight + 24 * 60 * 60 * 1000
    }
    // Post-show unlocks at offset and stays available forever.
    return now >= unlockAt
  })
}

/**
 * True if the email is on ANY active subscriber list for the org that
 * owns this show. Anonymous fans can "unlock" by entering an email that
 * matches an existing subscriber row — no auth flow required for v1.
 */
export async function emailIsSubscribed(
  showId: string,
  email: string,
): Promise<boolean> {
  if (!email || !email.includes('@')) return false
  const admin = createAdminClient()
  const { data: show } = await admin
    .from('shows')
    .select('tour_id, tours:tour_id(org_id)')
    .eq('id', showId)
    .maybeSingle()
  const orgId = (show?.tours as unknown as { org_id: string } | null)?.org_id
  if (!orgId) return false

  const { data: lists } = await admin
    .from('email_lists')
    .select('id')
    .eq('org_id', orgId)
  const listIds = (lists || []).map((l) => l.id)
  if (listIds.length === 0) return false

  const { count } = await admin
    .from('email_subscribers')
    .select('id', { count: 'exact', head: true })
    .in('list_id', listIds)
    .ilike('email', email.trim())
    .is('unsubscribed_at', null)
  return (count || 0) > 0
}
