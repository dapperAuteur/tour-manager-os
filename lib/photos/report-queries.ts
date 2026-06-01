import { createAdminClient } from '@/lib/supabase/admin'

export interface PhotoReportRow {
  id: string
  photo_id: string
  reason: string
  status: 'open' | 'reviewed' | 'actioned' | 'dismissed'
  reporter_user_id: string | null
  reporter_name: string | null
  created_at: string
  resolved_at: string | null
  resolution_notes: string | null
  photo: {
    id: string
    cloudinary_url: string
    caption: string | null
    status: string
    submitted_at: string
    show_id: string
    submitter_user_id: string | null
  } | null
  /** Cluster: how many open reports exist for the same photo. */
  reports_on_photo: number
}

/**
 * Admin view of fan-photo abuse reports. Open reports first, then most
 * recent. Photo + submitter + reporter info inlined so the admin page
 * doesn't N+1.
 */
export async function listPhotoReports(
  filter: 'open' | 'all' = 'open',
): Promise<PhotoReportRow[]> {
  const admin = createAdminClient()

  let req = admin
    .from('fan_photo_reports')
    .select('id, photo_id, reason, status, reporter_user_id, created_at, resolved_at, resolution_notes, fan_photos(id, cloudinary_url, caption, status, submitted_at, show_id, user_id)')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(200)
  if (filter === 'open') req = req.eq('status', 'open')

  const { data, error } = await req
  if (error || !data) return []

  // Bucket open-report counts per photo so we can flag repeat offenders.
  const openCountByPhoto = new Map<string, number>()
  for (const row of data) {
    if (row.status === 'open') {
      openCountByPhoto.set(
        row.photo_id,
        (openCountByPhoto.get(row.photo_id) || 0) + 1,
      )
    }
  }

  const reporterIds = Array.from(
    new Set(
      data
        .map((r) => r.reporter_user_id)
        .filter((v): v is string => !!v),
    ),
  )
  const reporterNames = new Map<string, string>()
  if (reporterIds.length > 0) {
    const { data: profiles } = await admin
      .from('user_profiles')
      .select('id, display_name')
      .in('id', reporterIds)
    for (const p of profiles || []) {
      if (p.display_name) reporterNames.set(p.id, p.display_name)
    }
  }

  return data.map((row) => {
    const photo = row.fan_photos as unknown as {
      id: string
      cloudinary_url: string
      caption: string | null
      status: string
      submitted_at: string
      show_id: string
      user_id: string | null
    } | null
    return {
      id: row.id,
      photo_id: row.photo_id,
      reason: row.reason,
      status: row.status as PhotoReportRow['status'],
      reporter_user_id: row.reporter_user_id,
      reporter_name: row.reporter_user_id
        ? reporterNames.get(row.reporter_user_id) || null
        : null,
      created_at: row.created_at as string,
      resolved_at: row.resolved_at as string | null,
      resolution_notes: row.resolution_notes,
      photo: photo
        ? {
            id: photo.id,
            cloudinary_url: photo.cloudinary_url,
            caption: photo.caption,
            status: photo.status,
            submitted_at: photo.submitted_at,
            show_id: photo.show_id,
            submitter_user_id: photo.user_id,
          }
        : null,
      reports_on_photo: openCountByPhoto.get(row.photo_id) || 0,
    }
  })
}
