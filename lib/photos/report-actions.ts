'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/auth/super-admin'

type Result = { ok: true } | { error: string }

/**
 * Resolve a report. `dismiss` keeps the photo published (false report);
 * `take_down` removes the photo (set status='rejected') AND marks the
 * report as actioned.
 */
export async function resolvePhotoReport(
  reportId: string,
  action: 'dismiss' | 'take_down',
  notes: string,
): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return { error: 'Admin access required.' }
  }

  const admin = createAdminClient()

  const { data: report, error: reportErr } = await admin
    .from('fan_photo_reports')
    .select('id, photo_id')
    .eq('id', reportId)
    .maybeSingle()
  if (reportErr || !report) return { error: 'Report not found.' }

  const newStatus = action === 'dismiss' ? 'dismissed' : 'actioned'
  const { error: upErr } = await admin
    .from('fan_photo_reports')
    .update({
      status: newStatus,
      resolved_by_user_id: user.id,
      resolved_at: new Date().toISOString(),
      resolution_notes: notes.trim() || null,
    })
    .eq('id', reportId)
  if (upErr) return { error: upErr.message }

  if (action === 'take_down') {
    // Remove the photo from the public wall. Keep the row + cloudinary
    // asset so we can audit later if needed.
    await admin
      .from('fan_photos')
      .update({
        status: 'rejected',
        moderated_by_user_id: user.id,
        moderated_at: new Date().toISOString(),
        rejection_reason: notes.trim() || 'Removed after abuse report',
      })
      .eq('id', report.photo_id)

    // Also auto-resolve every OTHER open report on the same photo as
    // actioned with the same notes — no point making the admin click N
    // times for the same takedown.
    await admin
      .from('fan_photo_reports')
      .update({
        status: 'actioned',
        resolved_by_user_id: user.id,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes.trim() || 'Auto-resolved with sibling report',
      })
      .eq('photo_id', report.photo_id)
      .neq('id', reportId)
      .eq('status', 'open')
  }

  revalidatePath('/admin/photo-reports')
  return { ok: true }
}
