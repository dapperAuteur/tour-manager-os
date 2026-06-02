'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/auth/super-admin'

type Result = { ok: true; id?: string } | { error: string }

async function requireSuperAdmin(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return { error: 'Admin access required.' }
  }
  return {}
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

interface CourseInput {
  title: string
  slug: string
  description: string | null
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_minutes: number | null
  sort_order: number
  published: boolean
}

function parseCourse(formData: FormData): CourseInput | { error: string } {
  const title = ((formData.get('title') as string | null) || '').trim()
  let slug = ((formData.get('slug') as string | null) || '').trim()
  if (!title) return { error: 'Title is required.' }
  if (!slug) slug = slugify(title)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'Slug may only contain lowercase letters, numbers, and dashes.' }
  }
  const category = ((formData.get('category') as string | null) || '').trim()
  if (!category) return { error: 'Category is required.' }
  const difficultyRaw = (formData.get('difficulty') as string | null) || 'beginner'
  const difficulty: CourseInput['difficulty'] =
    difficultyRaw === 'intermediate' || difficultyRaw === 'advanced'
      ? difficultyRaw
      : 'beginner'
  const estimatedStr = ((formData.get('estimated_minutes') as string | null) || '').trim()
  const estimated_minutes = estimatedStr ? Math.max(1, Math.trunc(Number(estimatedStr))) : null
  if (estimatedStr && (!Number.isFinite(estimated_minutes) || estimated_minutes === null)) {
    return { error: 'Estimated minutes must be a positive number.' }
  }
  const sortStr = ((formData.get('sort_order') as string | null) || '0').trim()
  const sort_order = Math.trunc(Number(sortStr) || 0)
  const description = ((formData.get('description') as string | null) || '').trim() || null
  const published = formData.get('published') === 'on'
  return {
    title,
    slug,
    description,
    category,
    difficulty,
    estimated_minutes,
    sort_order,
    published,
  }
}

export async function upsertCourse(
  formData: FormData,
  existingId?: string,
): Promise<Result> {
  const auth = await requireSuperAdmin()
  if (auth.error) return { error: auth.error }
  const parsed = parseCourse(formData)
  if ('error' in parsed) return parsed
  const admin = createAdminClient()
  if (existingId) {
    const { error } = await admin
      .from('courses')
      .update(parsed)
      .eq('id', existingId)
    if (error) return { error: error.message }
    revalidatePath('/admin/academy')
    revalidatePath(`/academy/${parsed.slug}`)
    return { ok: true, id: existingId }
  }
  const { data, error } = await admin
    .from('courses')
    .insert(parsed)
    .select('id')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/admin/academy')
  return { ok: true, id: data?.id }
}

export async function deleteCourse(id: string): Promise<Result> {
  const auth = await requireSuperAdmin()
  if (auth.error) return { error: auth.error }
  const admin = createAdminClient()
  const { error } = await admin.from('courses').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/academy')
  return { ok: true }
}

interface LessonInput {
  course_id: string
  title: string
  slug: string
  content: string
  video_url: string | null
  sort_order: number
  published: boolean
}

function parseLesson(formData: FormData): LessonInput | { error: string } {
  const courseId = ((formData.get('course_id') as string | null) || '').trim()
  if (!courseId) return { error: 'Missing course.' }
  const title = ((formData.get('title') as string | null) || '').trim()
  if (!title) return { error: 'Title is required.' }
  let slug = ((formData.get('slug') as string | null) || '').trim()
  if (!slug) slug = slugify(title)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'Slug may only contain lowercase letters, numbers, and dashes.' }
  }
  const content = ((formData.get('content') as string | null) || '').trim()
  if (!content) return { error: 'Lesson body is required.' }
  const video_url = ((formData.get('video_url') as string | null) || '').trim() || null
  const sortStr = ((formData.get('sort_order') as string | null) || '0').trim()
  const sort_order = Math.trunc(Number(sortStr) || 0)
  const published = formData.get('published') === 'on'
  return {
    course_id: courseId,
    title,
    slug,
    content,
    video_url,
    sort_order,
    published,
  }
}

export async function upsertLesson(
  formData: FormData,
  existingId?: string,
): Promise<Result> {
  const auth = await requireSuperAdmin()
  if (auth.error) return { error: auth.error }
  const parsed = parseLesson(formData)
  if ('error' in parsed) return parsed
  const admin = createAdminClient()
  if (existingId) {
    const { error } = await admin
      .from('lessons')
      .update(parsed)
      .eq('id', existingId)
    if (error) return { error: error.message }
    revalidatePath('/admin/academy')
    return { ok: true, id: existingId }
  }
  const { data, error } = await admin
    .from('lessons')
    .insert(parsed)
    .select('id')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/admin/academy')
  return { ok: true, id: data?.id }
}

export async function deleteLesson(id: string): Promise<Result> {
  const auth = await requireSuperAdmin()
  if (auth.error) return { error: auth.error }
  const admin = createAdminClient()
  const { error } = await admin.from('lessons').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/academy')
  return { ok: true }
}
