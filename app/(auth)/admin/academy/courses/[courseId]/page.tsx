import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { CourseForm } from '../../course-form'
import { LessonsEditor } from './lessons-editor'

export const metadata: Metadata = {
  title: 'Admin · Edit Course',
  robots: { index: false },
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-text-secondary">Admin access required.</p>
      </main>
    )
  }

  const admin = createAdminClient()
  const { data: course } = await admin
    .from('courses')
    .select(
      'id, title, slug, description, category, difficulty, estimated_minutes, sort_order, published',
    )
    .eq('id', courseId)
    .maybeSingle()
  if (!course) notFound()

  const { data: lessons } = await admin
    .from('lessons')
    .select('id, title, slug, content, video_url, sort_order, published')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/academy"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> All courses
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{course.title}</h1>

      <section className="mb-8 rounded-xl border border-border-default bg-surface-raised p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Course settings
        </h2>
        <CourseForm initial={course} />
      </section>

      <section
        aria-labelledby="lessons"
        className="rounded-xl border border-border-default bg-surface-raised p-6"
      >
        <h2 id="lessons" className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Lessons ({lessons?.length || 0})
        </h2>
        <LessonsEditor courseId={courseId} initial={lessons || []} />
      </section>
    </main>
  )
}
