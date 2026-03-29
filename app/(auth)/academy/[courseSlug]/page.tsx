import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCourseWithLessons, getUserCourseProgress } from '@/lib/academy/queries'

export const metadata: Metadata = { title: 'Course', robots: { index: false } }

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let data
  try { data = await getCourseWithLessons(courseSlug) } catch { notFound() }

  const progress = user ? await getUserCourseProgress(user.id) : { courses: new Map(), lessons: new Map() }
  const { course, lessons } = data

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/academy" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; All Courses</Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        {course.description && <p className="mt-2 text-text-secondary">{course.description}</p>}
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, idx) => {
          const lessonProgress = progress.lessons.get(lesson.id)
          const isComplete = lessonProgress?.completed

          return (
            <Link
              key={lesson.id}
              href={`/academy/${courseSlug}/${lesson.slug}`}
              className="flex items-center gap-4 rounded-xl border border-border-default bg-surface-raised p-4 transition-all hover:border-primary-500/50 hover:shadow-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-500" aria-label="Completed" />
                ) : (
                  <Circle className="h-5 w-5 text-border-default" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  <span className="text-text-muted">Lesson {idx + 1}:</span> {lesson.title}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
