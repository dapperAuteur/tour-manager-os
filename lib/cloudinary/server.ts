import { createHash } from 'node:crypto'

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  bytes: number
  format: string
}

interface UploadOptions {
  folder: string
  tags?: string[]
  context?: Record<string, string>
}

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary not configured: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET required',
    )
  }
  return { cloudName, apiKey, apiSecret }
}

export function isCloudinaryConfigured(): boolean {
  try {
    getCloudinaryConfig()
    return true
  } catch {
    return false
  }
}

function signParams(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1').update(sorted + apiSecret).digest('hex')
}

export async function uploadImage(
  fileBuffer: Buffer,
  opts: UploadOptions,
): Promise<UploadResult> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig()
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const paramsToSign: Record<string, string> = {
    folder: opts.folder,
    timestamp,
  }
  if (opts.tags?.length) paramsToSign.tags = opts.tags.join(',')
  if (opts.context) {
    paramsToSign.context = Object.entries(opts.context)
      .map(([k, v]) => `${k}=${v}`)
      .join('|')
  }

  const signature = signParams(paramsToSign, apiSecret)

  const form = new FormData()
  form.append('file', new Blob([fileBuffer as unknown as ArrayBuffer]))
  form.append('api_key', apiKey)
  form.append('timestamp', timestamp)
  form.append('folder', opts.folder)
  if (paramsToSign.tags) form.append('tags', paramsToSign.tags)
  if (paramsToSign.context) form.append('context', paramsToSign.context)
  form.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form },
  )

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Cloudinary upload failed (${res.status}): ${text}`)
  }

  return (await res.json()) as UploadResult
}

export async function destroyImage(publicId: string): Promise<void> {
  let cfg
  try {
    cfg = getCloudinaryConfig()
  } catch {
    return
  }
  const { cloudName, apiKey, apiSecret } = cfg
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const paramsToSign: Record<string, string> = {
    public_id: publicId,
    timestamp,
  }
  const signature = signParams(paramsToSign, apiSecret)

  const form = new URLSearchParams()
  form.set('public_id', publicId)
  form.set('api_key', apiKey)
  form.set('timestamp', timestamp)
  form.set('signature', signature)

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  }).catch(() => {
    // best-effort cleanup; swallow errors
  })
}
