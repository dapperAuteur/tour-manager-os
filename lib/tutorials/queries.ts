import { createClient } from '@/lib/supabase/server'

export interface TutorialStep {
  step_number: number
  title: string
  content: string
  media_url: string | null
  media_type: string | null
}

export interface TutorialState {
  steps: TutorialStep[]
  status: 'pending' | 'completed' | 'skipped'
  lastStep: number
}

/**
 * Returns the tutorial steps for a module and the current user's progress.
 * If the user has never seen the module or the progress row is missing,
 * status is 'pending' — the overlay should be shown.
 */
export async function getTutorialState(
  moduleId: string,
): Promise<TutorialState | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [stepsRes, progressRes] = await Promise.all([
    supabase
      .from('module_tutorials')
      .select('step_number, title, content, media_url, media_type')
      .eq('module_id', moduleId)
      .order('step_number'),
    supabase
      .from('user_tutorial_progress')
      .select('completed_at, skipped_at, last_step')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .maybeSingle(),
  ])

  const steps = (stepsRes.data || []) as TutorialStep[]
  if (steps.length === 0) return null

  const progress = progressRes.data
  let status: TutorialState['status'] = 'pending'
  if (progress?.completed_at) status = 'completed'
  else if (progress?.skipped_at) status = 'skipped'

  return {
    steps,
    status,
    lastStep: progress?.last_step ?? 0,
  }
}
