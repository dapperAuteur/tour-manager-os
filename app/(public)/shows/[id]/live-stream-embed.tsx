import { RadioTower } from 'lucide-react'

interface Props {
  embedHtml: string | null
  playbackUrl: string | null
}

/**
 * Server component. Renders the platform Viloud embed when the
 * env vars are set. Falls back to a raw iframe on the playback
 * URL when only that is set. Fully hidden when neither is set.
 */
export function LiveStreamEmbed({ embedHtml, playbackUrl }: Props) {
  if (!embedHtml && !playbackUrl) return null

  return (
    <section
      aria-label="Watch live"
      className="mb-8 overflow-hidden rounded-xl border border-error-500/40 bg-error-500/5"
    >
      <div className="flex items-center gap-2 border-b border-error-500/30 bg-error-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-error-600 dark:text-error-500">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-error-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-error-500" />
        </span>
        <RadioTower className="size-3.5" aria-hidden />
        Live now
      </div>
      <div className="aspect-video w-full bg-black">
        {embedHtml ? (
          <div
            className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full"
            // Embed HTML comes from the platform-owned STREAM_EMBED_CODE
            // env var. The trust boundary is the admin who sets it,
            // not user input, so dangerouslySetInnerHTML is safe here.
            dangerouslySetInnerHTML={{ __html: embedHtml }}
          />
        ) : (
          <iframe
            src={playbackUrl!}
            title="Live stream"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        )}
      </div>
    </section>
  )
}
