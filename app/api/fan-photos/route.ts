import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  destroyImage,
  isCloudinaryConfigured,
  uploadImage,
} from '@/lib/cloudinary/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

function uuidLooksValid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

export async function POST(request: Request) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: 'Cloudinary not configured' },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  const showId = form.get('show_id')
  const caption = form.get('caption')

  if (!(file instanceof Blob) || typeof showId !== 'string') {
    return NextResponse.json(
      { error: 'file and show_id required' },
      { status: 400 },
    )
  }
  if (!uuidLooksValid(showId)) {
    return NextResponse.json({ error: 'invalid show_id' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'unsupported file type — jpeg, png, webp, heic only' },
      { status: 415 },
    )
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `file too large — max ${MAX_FILE_SIZE / 1024 / 1024}MB` },
      { status: 413 },
    )
  }
  const captionText =
    typeof caption === 'string' && caption.trim().length > 0
      ? caption.trim().slice(0, 1000)
      : null

  // Eligibility check before burning Cloudinary bandwidth. Doubles as
  // the user-facing 403 — if we relied solely on the RLS INSERT
  // policy, the user would get a generic "row-level security" error
  // after the upload had already succeeded.
  const admin = createAdminClient()
  const { data: eligible, error: eligErr } = await admin.rpc(
    'can_post_photos_for_show',
    { _uid: user.id, _show_id: showId },
  )
  if (eligErr) {
    return NextResponse.json(
      { error: 'eligibility check failed' },
      { status: 500 },
    )
  }
  if (!eligible) {
    return NextResponse.json(
      { error: 'not a ticket holder for this show' },
      { status: 403 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  let upload
  try {
    upload = await uploadImage(buffer, {
      folder: `tour-manager-os/fan-photos/${showId}`,
      tags: ['fan-photo', `show:${showId}`, 'pending'],
      context: { user_id: user.id, show_id: showId },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'upload failed' },
      { status: 502 },
    )
  }

  // Insert through the authed client so the RLS INSERT policy
  // re-validates ticket-holder. Belt-and-suspenders with the explicit
  // RPC above.
  const { data: row, error: insertErr } = await supabase
    .from('fan_photos')
    .insert({
      show_id: showId,
      user_id: user.id,
      cloudinary_public_id: upload.public_id,
      cloudinary_url: upload.secure_url,
      width: upload.width,
      height: upload.height,
      caption: captionText,
    })
    .select('id, status, submitted_at')
    .single()

  if (insertErr) {
    // Roll back the orphaned Cloudinary asset.
    await destroyImage(upload.public_id)
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({
    id: row.id,
    status: row.status,
    submitted_at: row.submitted_at,
    public_id: upload.public_id,
    url: upload.secure_url,
    width: upload.width,
    height: upload.height,
  })
}
