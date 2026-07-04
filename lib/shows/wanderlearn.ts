/**
 * WanderLearn virtual-tour embed helpers.
 *
 * A band member pastes either the full WanderLearn <iframe ...> embed
 * code or just the tour URL. We pull out the src URL, confirm the host
 * is WanderLearn, and store ONLY that clean URL. The public page then
 * renders its own <iframe src={url}> — we never inject pasted markup —
 * so a malicious paste cannot smuggle scripts or a foreign origin onto
 * the page.
 */

/** Hosts we allow a virtual-tour embed from. */
const ALLOWED_HOSTS = new Set([
  'wanderlearn.witus.online',
  'www.wanderlearn.witus.online',
])

export interface WanderlearnParseResult {
  url: string | null
  error: string | null
}

/**
 * Accepts a pasted iframe snippet OR a bare URL and returns the clean,
 * allowlisted embed URL. Returns { url: null, error } when the input is
 * empty, has no usable URL, or points at a host we do not allow.
 */
export function parseWanderlearnInput(raw: string): WanderlearnParseResult {
  const trimmed = (raw || '').trim()
  if (!trimmed) return { url: null, error: 'Paste a WanderLearn tour link or embed code.' }

  // If they pasted an <iframe>, pull the src="...".
  let candidate = trimmed
  const srcMatch = trimmed.match(/src\s*=\s*["']([^"']+)["']/i)
  if (srcMatch) candidate = srcMatch[1]

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return { url: null, error: 'That does not look like a valid link.' }
  }

  if (parsed.protocol !== 'https:') {
    return { url: null, error: 'The link must start with https://.' }
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return {
      url: null,
      error: 'The link must be a wanderlearn.witus.online tour.',
    }
  }

  // Keep the path + query (theme/accent params are fine), drop any hash.
  parsed.hash = ''
  return { url: parsed.toString(), error: null }
}

/**
 * Guards the URL again at render time. A row could predate the
 * allowlist, so re-check before embedding.
 */
export function isAllowedWanderlearnUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && ALLOWED_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}
