import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getLesson } from '@/lib/academy/queries'
import { LessonContent } from './lesson-content'
import { QuizSection } from './quiz-section'

export const metadata: Metadata = { title: 'Lesson', robots: { index: false } }

export default async function LessonPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params

  let data
  try { data = await getLesson(courseSlug, lessonSlug) } catch { notFound() }

  const { course, lesson, quizzes, allLessons } = data
  const currentIdx = allLessons.findIndex((l) => l.slug === lessonSlug)
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href={`/academy/${courseSlug}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">
        &larr; {course.title}
      </Link>

      <article className="mb-8 rounded-xl border border-border-default bg-surface-raised p-8">
        <p className="mb-1 text-xs font-medium text-primary-600 dark:text-primary-400">
          Lesson {currentIdx + 1} of {allLessons.length}
        </p>
        <h1 className="mb-6 text-2xl font-bold">{lesson.title}</h1>
        <LessonContent content={lesson.content} />
      </article>

      {/* Quiz */}
      {quizzes.length > 0 && (
        <div className="mb-8">
          <QuizSection quizzes={quizzes} lessonId={lesson.id} courseId={course.id} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevLesson ? (
          <Link href={`/academy/${courseSlug}/${prevLesson.slug}`} className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {prevLesson.title}
          </Link>
        ) : <div />}
        {nextLesson ? (
          <Link href={`/academy/${courseSlug}/${nextLesson.slug}`} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline dark:text-primary-400">
            {nextLesson.title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <Link href={`/academy/${courseSlug}`} className="inline-flex items-center gap-1 text-sm text-success-600 hover:underline dark:text-success-500">
            Course complete! View all lessons <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </main>
  )
}
