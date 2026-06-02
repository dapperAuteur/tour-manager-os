'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true; id?: string } | { error: string }

interface CreateInput {
  show_id: string
  org_id: string
  phase: 'pre' | 'post'
  unlock_offset_hours: number
  title: string
  body: string | null
  media_url: string | null
  call_to_action_label: string | null
  call_to_action_url: string | null
}

function parse(formData: FormData): CreateInput | { error: string } {
  const showId = ((formData.get('show_id') as string | null) || '').trim()
  const orgId = ((formData.get('org_id') as string | null) || '').trim()
  const phase = (formData.get('phase') as string | null) || 'pre'
  const offsetStr = (formData.get('unlock_offset_hours') as string | null) || ''
  const title = ((formData.get('title') as string | null) || '').trim()
  const body = ((formData.get('body') as string | null) || '').trim() || null
  const mediaUrl = ((formData.get('media_url') as string | null) || '').trim() || null
  const ctaLabel = ((formData.get('call_to_action_label') as string | null) || '').trim() || null
  const ctaUrl = ((formData.get('call_to_action_url') as string | null) || '').trim() || null

  if (!showId || !orgId) return { error: 'Missing show or org.' }
  if (phase !== 'pre' && phase !== 'post') return { error: 'Phase must be pre or post.' }
  const offset = Number(offsetStr)
  if (!Number.isFinite(offset)) return { error: 'Offset must be a number of hours.' }
  if (!title) return { error: 'Title is required.' }
  if (ctaUrl && !ctaLabel) return { error: 'A CTA URL needs a button label too.' }
  return {
    show_id: showId,
    org_id: orgId,
    phase,
    unlock_offset_hours: Math.trunc(offset),
    title,
    body,
    media_url: mediaUrl,
    call_to_action_label: ctaLabel,
    call_to_action_url: ctaUrl,
  }
}

export async function createExclusivePiece(formData: FormData): Promise<Result> {
  const parsed = parse(formData)
  if ('error' in parsed) return parsed

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { data, error } = await supabase
    .from('show_exclusive_content')
    .insert({ ...parsed, created_by: user.id })
    .select('id')
    .single()
  if (error) return { error: error.message }
  revalidatePath(`/tours`)
  return { ok: true, id: data?.id }
}

export async function deleteExclusivePiece(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('show_exclusive_content')
    .delete()
    .eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}

export async function setExclusiveActive(
  id: string,
  active: boolean,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('show_exclusive_content')
    .update({ active })
    .eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}
