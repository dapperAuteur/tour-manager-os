import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildCertificatePdf } from '@/lib/academy/certificate'

/**
 * GET /api/academy/courses/[courseSlug]/certificate
 *
 * Returns a PDF certificate for the signed-in user when their
 * user_course_progress row for the matching course is `completed`.
 * 403 if not completed, 404 if the course doesn't exist.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseSlug: string }> },
) {
  const { courseSlug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseSlug)
    .maybeSingle()
  if (!course) {
    return NextResponse.json({ error: 'course not found' }, { status: 404 })
  }

  const { data: progress } = await supabase
    .from('user_course_progress')
    .select('id, status, completed_at')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()
  if (!progress || progress.status !== 'completed' || !progress.completed_at) {
    return NextResponse.json(
      { error: 'course not yet completed' },
      { status: 403 },
    )
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()
  const recipientName =
    profile?.display_name ||
    user.email?.split('@')[0] ||
    'Tour Manager OS Learner'

  const pdfBytes = await buildCertificatePdf({
    recipientName,
    courseTitle: course.title,
    completedAt: new Date(progress.completed_at),
    verificationId: progress.id,
  })

  const filename = `tour-manager-os-${course.slug}-certificate.pdf`
  return new Response(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=0, no-store',
    },
  })
}
