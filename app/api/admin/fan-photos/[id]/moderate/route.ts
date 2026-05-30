import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { destroyImage } from '@/lib/cloudinary/server'
import { sendEmail, isMailgunConfigured } from '@/lib/email/mailgun'

interface RouteContext {
  params: Promise<{ id: string }>
}

type ModerationAction = 'approve' | 'reject' | 'remove'

interface ModerateBody {
  action: ModerationAction
  reason?: string
}

export async function POST(request: Request, context: RouteContext) {
  const { id: photoId } = await context.params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: ModerateBody
  try {
    body = (await request.json()) as ModerateBody
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (!['approve', 'reject', 'remove'].includes(body.action)) {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 })
  }
  const reason =
    typeof body.reason === 'string' && body.reason.trim().length > 0
      ? body.reason.trim().slice(0, 500)
      : null
  if (body.action === 'reject' && !reason) {
    return NextResponse.json(
      { error: 'reason required for reject' },
      { status: 400 },
    )
  }

  // RLS gates the update — only tour staff for the photo's show can
  // flip its status. If the user isn't on staff, the .update returns
  // zero rows.
  const nextStatus =
    body.action === 'approve'
      ? 'approved'
      : body.action === 'reject'
        ? 'rejected'
        : 'removed'

  const { data: updated, error: updErr } = await supabase
    .from('fan_photos')
    .update({
      status: nextStatus,
      moderated_by_user_id: user.id,
      moderated_at: new Date().toISOString(),
      rejection_reason: nextStatus === 'rejected' ? reason : null,
    })
    .eq('id', photoId)
    .select(
      'id, status, cloudinary_public_id, show_id, user_id, shows(date, city, state, venue_name, tours(artist_name, name))',
    )
    .single()

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }
  if (!updated) {
    return NextResponse.json({ error: 'not found or forbidden' }, { status: 404 })
  }

  // If we removed (post-approval takedown) or rejected, destroy the
  // Cloudinary asset so it can't be hot-linked anymore.
  if (nextStatus === 'rejected' || nextStatus === 'removed') {
    await destroyImage(updated.cloudinary_public_id)
  }

  // Courtesy email to the poster on reject so they know why. Skip on
  // approve (we don't want to spam every approval) and remove
  // (post-approval takedown — staff can reach out manually).
  if (nextStatus === 'rejected' && reason && isMailgunConfigured() && updated.user_id) {
    const admin = createAdminClient()
    const { data: posterData } = await admin.auth.admin.getUserById(updated.user_id)
    const posterEmail = posterData?.user?.email
    if (posterEmail) {
      type EmbeddedTour = { artist_name: string | null; name: string | null }
      type EmbeddedShow = {
        date: string
        city: string
        state: string | null
        venue_name: string | null
        tours: EmbeddedTour | EmbeddedTour[] | null
      }
      const showRaw = updated.shows as EmbeddedShow | EmbeddedShow[] | null
      const show = Array.isArray(showRaw) ? showRaw[0] : showRaw
      const tour = show
        ? Array.isArray(show.tours) ? show.tours[0] : show.tours
        : null
      const artist = tour?.artist_name || tour?.name || 'the tour'
      const venue =
        show?.venue_name ||
        (show ? `${show.city}${show.state ? ', ' + show.state : ''}` : '')

      try {
        await sendEmail({
          to: posterEmail,
          subject: `Your photo wasn't approved`,
          tags: ['fan-photos', 'fan-photos:rejected'],
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="margin:0 0 16px;">Photo not approved</h2>
              <p style="color:#444;margin:0 0 16px;">
                Thanks for sharing your photo from <strong>${artist}</strong>${venue ? ` at ${venue}` : ''}.
                Unfortunately we weren&apos;t able to approve it.
              </p>
              <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 16px;">
                <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">Reason</p>
                <p style="margin:0;white-space:pre-wrap;">${reason}</p>
              </div>
              <p style="color:#444;margin:0 0 16px;">
                Feel free to share another shot from the show — we&apos;d love to see it.
              </p>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;">— Tour Manager OS | Tour.WitUS.Online</p>
            </div>
          `,
        })
      } catch {
        // Email is non-critical — the moderation is recorded regardless.
      }
    }
  }

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
  })
}
