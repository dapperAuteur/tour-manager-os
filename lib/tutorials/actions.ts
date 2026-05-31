'use server'

import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

async function upsertProgress(
  moduleId: string,
  patch: Record<string, unknown>,
): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { error } = await supabase
    .from('user_tutorial_progress')
    .upsert(
      {
        user_id: user.id,
        module_id: moduleId,
        updated_at: new Date().toISOString(),
        ...patch,
      },
      { onConflict: 'user_id,module_id' },
    )
  if (error) return { error: error.message }
  return { ok: true }
}

export async function markTutorialCompleted(moduleId: string): Promise<Result> {
  return upsertProgress(moduleId, {
    completed_at: new Date().toISOString(),
    skipped_at: null,
  })
}

export async function markTutorialSkipped(moduleId: string): Promise<Result> {
  return upsertProgress(moduleId, {
    skipped_at: new Date().toISOString(),
    completed_at: null,
  })
}

export async function updateTutorialStep(
  moduleId: string,
  step: number,
): Promise<Result> {
  return upsertProgress(moduleId, { last_step: step })
}

export async function resetTutorial(moduleId: string): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }
  const { error } = await supabase
    .from('user_tutorial_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
  if (error) return { error: error.message }
  return { ok: true }
}
