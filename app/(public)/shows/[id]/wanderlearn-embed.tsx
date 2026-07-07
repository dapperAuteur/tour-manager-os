import { Globe } from 'lucide-react'
import { isAllowedWanderlearnUrl } from '@/lib/shows/wanderlearn'

interface Props {
  url: string | null
}

/**
 * Server component. Renders the WanderLearn 360 tour in a controlled
 * iframe. We build the iframe ourselves from the stored src URL and
 * re-check the host allowlist, so a bad row can never inject markup or
 * a foreign origin. Hidden when there is no (valid) tour.
 */
export function WanderlearnEmbed({ url }: Props) {
  if (!isAllowedWanderlearnUrl(url)) return null

  return (
    <section
      aria-label="Virtual tour"
      className="mb-8 overflow-hidden rounded-xl border border-border-default bg-surface-raised"
    >
      <div className="flex items-center gap-2 border-b border-border-default px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
        <Globe className="size-3.5" aria-hidden />
        Virtual tour
      </div>
      <iframe
        src={url as string}
        title="WanderLearn virtual tour"
        width="100%"
        height="600"
        loading="lazy"
        allow="fullscreen; gyroscope; accelerometer"
        allowFullScreen
        className="block w-full border-0"
      />
    </section>
  )
}
