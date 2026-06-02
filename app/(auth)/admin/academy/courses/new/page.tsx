import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { CourseForm } from '../../course-form'

export const metadata: Metadata = {
  title: 'Admin · New Course',
  robots: { index: false },
}

export default async function NewCoursePage() {
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

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/academy"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> All courses
      </Link>
      <h1 className="mb-6 text-2xl font-bold">New course</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <CourseForm />
      </div>
    </main>
  )
}
