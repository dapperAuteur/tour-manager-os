import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  destroyImage,
  isCloudinaryConfigured,
  uploadImage,
} from '@/lib/cloudinary/server'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const MAX_PHOTOS_PER_VENUE = 24
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

interface StoredPhoto {
  url: string
  public_id: string
  caption?: string | null
  uploaded_by?: string
  uploaded_at?: string
}

function asPhotoArray(raw: unknown): StoredPhoto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((r) => {
      if (typeof r === 'string') return { url: r, public_id: '' }
      if (r && typeof r === 'object' && typeof (r as StoredPhoto).url === 'string') {
        return r as StoredPhoto
      }
      return null
    })
    .filter((r): r is StoredPhoto => r !== null)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: venueId } = await params

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

  const { data: venue } = await supabase
    .from('venue_profiles')
    .select('id, photo_urls')
    .eq('id', venueId)
    .maybeSingle()
  if (!venue) {
    return NextResponse.json({ error: 'venue not found' }, { status: 404 })
  }
  const existing = asPhotoArray(venue.photo_urls)
  if (existing.length >= MAX_PHOTOS_PER_VENUE) {
    return NextResponse.json(
      { error: `venue already has ${MAX_PHOTOS_PER_VENUE} photos — delete one first` },
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
  const caption = ((form.get('caption') as string | null) ?? '').trim() || null
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
      folder: `tour-manager-os/venues/${venueId}`,
      tags: ['venue-photo', `venue:${venueId}`, `user:${user.id}`],
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'upload failed' },
      { status: 502 },
    )
  }

  const next: StoredPhoto[] = [
    ...existing,
    {
      url: upload.secure_url,
      public_id: upload.public_id,
      caption,
      uploaded_by: user.id,
      uploaded_at: new Date().toISOString(),
    },
  ]

  const { error: updateError } = await supabase
    .from('venue_profiles')
    .update({ photo_urls: next })
    .eq('id', venueId)

  if (updateError) {
    await destroyImage(upload.public_id)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ photos: next })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: venueId } = await params
  const url = new URL(request.url)
  const publicId = url.searchParams.get('public_id')
  if (!publicId) {
    return NextResponse.json({ error: 'public_id required' }, { status: 400 })
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
    .select('id, photo_urls')
    .eq('id', venueId)
    .maybeSingle()
  if (!venue) {
    return NextResponse.json({ error: 'venue not found' }, { status: 404 })
  }
  const existing = asPhotoArray(venue.photo_urls)
  const next = existing.filter((p) => p.public_id !== publicId)
  if (next.length === existing.length) {
    return NextResponse.json({ error: 'photo not found' }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from('venue_profiles')
    .update({ photo_urls: next })
    .eq('id', venueId)
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await destroyImage(publicId)
  return NextResponse.json({ photos: next })
}
