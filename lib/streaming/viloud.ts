/**
 * Viloud.tv live-stream helpers.
 *
 * The platform holds one Viloud account. Two env vars:
 *  - RTMP_STREAM_PLAYBACK_URL: HLS or embeddable playback URL
 *  - STREAM_EMBED_CODE: raw HTML embed snippet Viloud gives you
 *
 * We render STREAM_EMBED_CODE via dangerouslySetInnerHTML on the
 * public event page. The trust boundary is the platform env var
 * (admin-set, not user-supplied), so this is safe.
 */

export function isStreamingConfigured(): boolean {
  const embed = process.env.STREAM_EMBED_CODE
  const playback = process.env.RTMP_STREAM_PLAYBACK_URL
  return Boolean((embed && embed.trim().length > 0) || (playback && playback.trim().length > 0))
}

export function getStreamEmbedCode(): string | null {
  const embed = process.env.STREAM_EMBED_CODE
  if (embed && embed.trim().length > 0) return embed
  return null
}

export function getStreamPlaybackUrl(): string | null {
  const url = process.env.RTMP_STREAM_PLAYBACK_URL
  if (url && url.trim().length > 0) return url
  return null
}
