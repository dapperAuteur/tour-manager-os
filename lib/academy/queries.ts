import { createClient } from '@/lib/supabase/server'

export async function getCourses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*, lessons(count)')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getCourseWithLessons(slug: string) {
  const supabase = await createClient()
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) throw error

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .eq('published', true)
    .order('sort_order', { ascending: true })

  return { course, lessons: lessons || [] }
}

export async function getLesson(courseSlug: string, lessonSlug: string) {
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseSlug)
    .single()

  if (!course) throw new Error('Course not found')

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .eq('slug', lessonSlug)
    .single()

  if (error) throw error

  const { data: quizzes } = await supabase
    .from('lesson_quizzes')
    .select('*')
    .eq('lesson_id', lesson.id)
    .order('sort_order', { ascending: true })

  // Get all lessons for navigation
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('slug, title, sort_order')
    .eq('course_id', course.id)
    .eq('published', true)
    .order('sort_order', { ascending: true })

  return { course, lesson, quizzes: quizzes || [], allLessons: allLessons || [] }
}

export async function getUserCourseProgress(userId: string) {
  const supabase = await createClient()
  const { data: courseProgress } = await supabase
    .from('user_course_progress')
    .select('*')
    .eq('user_id', userId)

  const { data: lessonProgress } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)

  return {
    courses: new Map((courseProgress || []).map((p) => [p.course_id, p])),
    lessons: new Map((lessonProgress || []).map((p) => [p.lesson_id, p])),
  }
}
