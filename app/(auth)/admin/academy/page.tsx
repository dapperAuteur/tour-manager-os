import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/auth/super-admin'

export const metadata: Metadata = {
  title: 'Admin · Academy',
  robots: { index: false },
}

export default async function AdminAcademyPage() {
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

  // Admin client to read both published and unpublished courses.
  const admin = createAdminClient()
  const { data: courses } = await admin
    .from('courses')
    .select('id, title, slug, category, difficulty, published, sort_order, estimated_minutes')
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true })

  const { data: lessonCounts } = await admin
    .from('lessons')
    .select('course_id')

  const counts = new Map<string, number>()
  for (const row of lessonCounts || []) {
    counts.set(row.course_id, (counts.get(row.course_id) || 0) + 1)
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/dashboard"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Back to admin
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BookOpen className="size-5" aria-hidden /> Academy editor
        </h1>
        <Link
          href="/admin/academy/courses/new"
          className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="size-3.5" aria-hidden /> New course
        </Link>
      </div>

      {(courses || []).length === 0 ? (
        <p className="rounded-xl border border-border-default bg-surface-raised p-6 text-sm text-text-secondary">
          No courses yet. Create one to start seeding the Academy.
        </p>
      ) : (
        <ul className="space-y-3">
          {(courses || []).map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-border-default bg-surface-raised p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {c.title}
                    {!c.published && (
                      <span className="rounded-full bg-text-muted/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                        Draft
                      </span>
                    )}
                    <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                      {c.difficulty}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {c.category} · slug <code className="font-mono">{c.slug}</code> ·{' '}
                    {counts.get(c.id) ?? 0} lesson
                    {(counts.get(c.id) ?? 0) === 1 ? '' : 's'}
                    {c.estimated_minutes ? ` · ${c.estimated_minutes} min` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/admin/academy/courses/${c.id}`}
                    className="rounded-md border border-border-default px-2.5 py-1 text-xs hover:bg-surface-alt"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/academy/${c.slug}`}
                    target="_blank"
                    className="rounded-md border border-border-default px-2.5 py-1 text-xs hover:bg-surface-alt"
                  >
                    View
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
