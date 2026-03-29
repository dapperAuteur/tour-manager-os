'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markLessonComplete(lessonId: string, courseId: string, quizScore?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Mark lesson complete
  await supabase.from('user_lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    completed: true,
    completed_at: new Date().toISOString(),
    quiz_score: quizScore ?? null,
  })

  // Check if all lessons in course are complete
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)
    .eq('published', true)

  const { data: completedLessons } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .eq('completed', true)
    .in('lesson_id', (allLessons || []).map((l) => l.id))

  const allComplete = allLessons?.length === completedLessons?.length

  // Update course progress
  await supabase.from('user_course_progress').upsert({
    user_id: user.id,
    course_id: courseId,
    status: allComplete ? 'completed' : 'in_progress',
    started_at: new Date().toISOString(),
    completed_at: allComplete ? new Date().toISOString() : null,
  })

  revalidatePath('/academy')
  return { success: true, courseComplete: allComplete }
}
