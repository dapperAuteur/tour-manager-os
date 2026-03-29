import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, BookOpen, Clock, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCourses, getUserCourseProgress } from '@/lib/academy/queries'

export const metadata: Metadata = { title: 'Academy', robots: { index: false } }

const difficultyColors: Record<string, string> = {
  beginner: 'bg-success-500/20 text-success-600 dark:text-success-500',
  intermediate: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  advanced: 'bg-error-500/20 text-error-500',
}

export default async function AcademyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const courses = await getCourses()
  const progress = user ? await getUserCourseProgress(user.id) : { courses: new Map(), lessons: new Map() }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <GraduationCap className="mx-auto mb-3 h-10 w-10 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Academy</h1>
        <p className="mt-1 text-sm text-text-secondary">Learn to get the most from Tour Manager OS.</p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const courseProgress = progress.courses.get(course.id)
            const isComplete = courseProgress?.status === 'completed'
            const isStarted = courseProgress?.status === 'in_progress'
            const lessonCount = Array.isArray(course.lessons) ? course.lessons.length : 0

            return (
              <Link
                key={course.id}
                href={`/academy/${course.slug}`}
                className="group rounded-xl border border-border-default bg-surface-raised p-6 transition-all hover:border-primary-500/50 hover:shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
                    <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  {isComplete && (
                    <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-500" aria-label="Completed" />
                  )}
                </div>

                <h2 className="mb-1 font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="mb-3 text-sm text-text-secondary">{course.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${difficultyColors[course.difficulty] || ''}`}>
                    {course.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" aria-hidden="true" />
                    {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
                  </span>
                  {course.estimated_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      ~{course.estimated_minutes} min
                    </span>
                  )}
                  {isStarted && !isComplete && (
                    <span className="rounded-full bg-primary-500/20 px-2 py-0.5 font-medium text-primary-600 dark:text-primary-400">
                      In Progress
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
