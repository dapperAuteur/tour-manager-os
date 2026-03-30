'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Table = 'tours' | 'shows' | 'expenses' | 'merch_products' | 'merch_sales' |
  'email_lists' | 'email_campaigns' | 'community_posts' | 'community_replies' |
  'polls' | 'practice_sessions' | 'shared_albums' | 'equipment' | 'stage_plots' |
  'input_lists' | 'venue_notes' | 'blog_posts' | 'shared_audio' | 'setlists' |
  'setlist_songs' | 'travel_arrangements' | 'tour_packages' | 'package_acts' |
  'warmup_routines' | 'feedback_threads' | 'advance_sheets'

export async function deleteRecord(table: Table, id: string, revalidate?: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) return { error: error.message }
  if (revalidate) revalidatePath(revalidate)
  return { success: true }
}

export async function updateRecord(table: Table, id: string, updates: Record<string, unknown>, revalidate?: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(table).update(updates).eq('id', id)
  if (error) return { error: error.message }
  if (revalidate) revalidatePath(revalidate)
  return { success: true }
}

export async function duplicateRecord(table: Table, id: string, overrides?: Record<string, unknown>, revalidate?: string) {
  const supabase = await createClient()

  // Fetch original
  const { data: original, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !original) return { error: 'Record not found' }

  // Remove id and timestamps, apply overrides
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = original as Record<string, unknown>

  // Modify name/title to indicate copy
  const copy = { ...rest, ...overrides }
  if (typeof copy.name === 'string') copy.name = `${copy.name} (Copy)`
  if (typeof copy.title === 'string') copy.title = `${copy.title} (Copy)`
  if (typeof copy.slug === 'string') copy.slug = `${copy.slug}-copy-${Date.now()}`
  if ('status' in copy) copy.status = 'draft'
  if ('published' in copy) copy.published = false

  const { data: newRecord, error: insertError } = await supabase
    .from(table)
    .insert(copy)
    .select('id')
    .single()

  if (insertError) return { error: insertError.message }

  // For tables with child records, duplicate those too
  if (table === 'setlists' && newRecord) {
    const { data: songs } = await supabase.from('setlist_songs').select('*').eq('setlist_id', id)
    if (songs && songs.length > 0) {
      await supabase.from('setlist_songs').insert(
        songs.map(({ id: _sid, created_at: _sca, ...song }) => ({ ...song, setlist_id: newRecord.id }))
      )
    }
  }

  if (table === 'input_lists' && newRecord) {
    const { data: channels } = await supabase.from('input_channels').select('*').eq('input_list_id', id)
    if (channels && channels.length > 0) {
      await supabase.from('input_channels').insert(
        channels.map(({ id: _cid, ...ch }) => ({ ...ch, input_list_id: newRecord.id }))
      )
    }
  }

  if (table === 'tour_packages' && newRecord) {
    const { data: acts } = await supabase.from('package_acts').select('*').eq('package_id', id)
    if (acts && acts.length > 0) {
      await supabase.from('package_acts').insert(
        acts.map(({ id: _aid, created_at: _aca, ...act }) => ({ ...act, package_id: newRecord.id }))
      )
    }
  }

  if (revalidate) revalidatePath(revalidate)
  return { success: true, newId: newRecord.id }
}
