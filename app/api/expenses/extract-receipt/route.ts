import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { destroyImage, isCloudinaryConfigured, uploadImage } from '@/lib/cloudinary/server'
import { extractReceipt } from '@/lib/ai/vision'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

// POST multipart with `file` field. Uploads to Cloudinary under a
// per-user folder, runs the vision extractor, and returns the URL +
// best-effort extracted fields. The client uses the result to
// pre-fill the expense form; the user reviews and saves via the
// existing createExpense action which now also persists receipt_url.
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
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
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

  const buffer = Buffer.from(await file.arrayBuffer())
  let upload
  try {
    upload = await uploadImage(buffer, {
      folder: `tour-manager-os/receipts/${user.id}`,
      tags: ['receipt', `user:${user.id}`],
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'upload failed' },
      { status: 502 },
    )
  }

  const extracted = await extractReceipt(upload.secure_url)

  // If extraction completely failed (model down, network), still
  // return the receipt_url so the user can fill the form manually.
  // We do NOT destroy the asset on extraction failure — they may
  // still want to attach the receipt.
  return NextResponse.json({
    receipt_url: upload.secure_url,
    public_id: upload.public_id,
    extracted: extracted ?? null,
  })
}

// Allow the client to clean up an uploaded receipt if the user
// cancels the expense form without saving (e.g. they realize they
// shot the wrong receipt). Auth required + must be one of their own.
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const publicId = url.searchParams.get('public_id')
  if (!publicId || !publicId.startsWith(`tour-manager-os/receipts/${user.id}/`)) {
    return NextResponse.json({ error: 'invalid public_id' }, { status: 400 })
  }

  await destroyImage(publicId)
  return NextResponse.json({ ok: true })
}
