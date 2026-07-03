import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  destroyFile,
  isCloudinaryConfigured,
  uploadFile,
} from '@/lib/cloudinary/server'

const MAX_FILE_SIZE = 15 * 1024 * 1024
const MAX_DOCS_PER_VENUE = 40
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const ALLOWED_KINDS = new Set(['sound', 'lights', 'video', 'stage_plot', 'other'])

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: venueId } = await params

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: 'File storage not configured' },
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

  const { data: venue } = await supabase
    .from('venue_profiles')
    .select('id')
    .eq('id', venueId)
    .maybeSingle()
  if (!venue) {
    return NextResponse.json({ error: 'venue not found' }, { status: 404 })
  }

  const { count } = await supabase
    .from('venue_documents')
    .select('*', { count: 'exact', head: true })
    .eq('venue_id', venueId)
  if ((count ?? 0) >= MAX_DOCS_PER_VENUE) {
    return NextResponse.json(
      { error: `venue already has ${MAX_DOCS_PER_VENUE} documents — delete one first` },
      { status: 409 },
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  const kind = ((form.get('kind') as string | null) ?? 'other').trim()
  const title = ((form.get('title') as string | null) ?? '').trim()
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: 'invalid kind' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'unsupported file type — pdf, txt, md, csv, or image only' },
      { status: 415 },
    )
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `file too large — max ${MAX_FILE_SIZE / 1024 / 1024}MB` },
      { status: 413 },
    )
  }

  const fileName =
    file instanceof File && file.name ? file.name.replace(/\.[^.]+$/, '') : 'document'
  const finalTitle = (title || fileName).slice(0, 120)

  const buffer = Buffer.from(await file.arrayBuffer())
  let upload
  try {
    upload = await uploadFile(buffer, {
      folder: `tour-manager-os/venue-docs/${venueId}`,
      tags: ['venue-doc', `venue:${venueId}`, `kind:${kind}`],
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'upload failed' },
      { status: 502 },
    )
  }

  // Admin client so the insert is not blocked if the caller's RLS
  // session is stale; the auth gate above already ran.
  const admin = createAdminClient()
  const { data: inserted, error } = await admin
    .from('venue_documents')
    .insert({
      venue_id: venueId,
      kind,
      title: finalTitle,
      file_url: upload.secure_url,
      public_id: upload.public_id,
      content_type: file.type,
      bytes: upload.bytes,
      uploaded_by: user.id,
    })
    .select('id, kind, title, file_url, public_id, content_type, bytes, created_at')
    .single()

  if (error) {
    await destroyFile(upload.public_id, upload.resource_type)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ document: inserted })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: venueId } = await params
  const url = new URL(request.url)
  const docId = url.searchParams.get('id')
  if (!docId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: doc } = await admin
    .from('venue_documents')
    .select('id, public_id')
    .eq('id', docId)
    .eq('venue_id', venueId)
    .maybeSingle()
  if (!doc) {
    return NextResponse.json({ error: 'document not found' }, { status: 404 })
  }

  const { error } = await admin
    .from('venue_documents')
    .delete()
    .eq('id', docId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (doc.public_id) {
    // Documents are raw uploads; images fall back cleanly.
    await destroyFile(doc.public_id, 'raw')
  }

  return NextResponse.json({ ok: true })
}
