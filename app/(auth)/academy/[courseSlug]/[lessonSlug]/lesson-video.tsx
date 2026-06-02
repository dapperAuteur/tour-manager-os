import { ExternalLink } from 'lucide-react'

/**
 * Parses common video share URLs into something embeddable.
 *
 * Supported:
 *   - YouTube (youtube.com/watch?v=, youtu.be/<id>, youtube.com/shorts/<id>)
 *   - Vimeo (vimeo.com/<id>)
 *   - Loom (loom.com/share/<id>)
 *   - Direct .mp4 / .webm / .mov
 *
 * Returns null when the URL doesn't match a known shape so the caller
 * can fall back to a "watch on <host>" link.
 */
export function videoEmbedFor(url: string): {
  kind: 'iframe' | 'video'
  src: string
  title: string
} | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const host = parsed.host.replace(/^www\./, '')

  // YouTube
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id =
      parsed.searchParams.get('v') ||
      parsed.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1]
    if (id) {
      return {
        kind: 'iframe',
        src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        title: 'YouTube video player',
      }
    }
  }
  if (host === 'youtu.be') {
    const id = parsed.pathname.replace(/^\//, '').split('/')[0]
    if (id) {
      return {
        kind: 'iframe',
        src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        title: 'YouTube video player',
      }
    }
  }

  // Vimeo
  if (host === 'vimeo.com') {
    const id = parsed.pathname.split('/').filter(Boolean)[0]
    if (id && /^\d+$/.test(id)) {
      return {
        kind: 'iframe',
        src: `https://player.vimeo.com/video/${id}`,
        title: 'Vimeo video player',
      }
    }
  }

  // Loom
  if (host === 'loom.com') {
    const id = parsed.pathname.match(/^\/share\/([\w-]+)/)?.[1]
    if (id) {
      return {
        kind: 'iframe',
        src: `https://www.loom.com/embed/${id}`,
        title: 'Loom video player',
      }
    }
  }

  // Direct video file
  if (/\.(mp4|webm|mov|ogv)$/i.test(parsed.pathname)) {
    return {
      kind: 'video',
      src: url,
      title: 'Lesson video',
    }
  }

  return null
}

export function LessonVideo({ url }: { url: string }) {
  const embed = videoEmbedFor(url)
  if (!embed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 inline-flex items-center gap-1 rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm font-medium text-primary-700 hover:bg-surface-alt dark:text-primary-300"
      >
        Watch lesson video <ExternalLink className="size-3.5" aria-hidden />
      </a>
    )
  }
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-border-default bg-black">
      <div className="relative aspect-video w-full">
        {embed.kind === 'iframe' ? (
          <iframe
            src={embed.src}
            title={embed.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <video
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full"
            aria-label={embed.title}
          >
            <source src={embed.src} />
            Your browser does not support embedded video.{' '}
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open the video in a new tab
            </a>
            .
          </video>
        )}
      </div>
    </div>
  )
}
