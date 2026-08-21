/**
 * Wanderlust virtual-tour embed helpers. (Filename and exported symbols keep
 * the old spelling — renaming them is a wide refactor for no behavioural gain,
 * and this module's job is unchanged.)
 *
 * A band member pastes either the full Wanderlust <iframe ...> embed
 * code or just the tour URL. We pull out the src URL, confirm the host
 * is Wanderlust, and store ONLY that clean URL. The public page then
 * renders its own <iframe src={url}> — we never inject pasted markup —
 * so a malicious paste cannot smuggle scripts or a foreign origin onto
 * the page.
 */

/**
 * Hosts we allow a virtual-tour embed from.
 *
 * BOTH names are here on purpose. Wanderlearn was renamed to Wanderlust in
 * 2026-08 and moved host; the old host stays attached and 308-redirects, so
 * links shared before the move are still in circulation — in saved shows, in
 * emails, on partner pages. Dropping the old host would reject those, and this
 * allowlist is the thing standing between a paste and an iframe, so a rejection
 * here is a dead feature rather than a warning.
 *
 * Adding the new host is not optional either: without it, every tour shared
 * after the move is refused with a message naming a domain that no longer
 * matches what the user is looking at.
 */
const ALLOWED_HOSTS = new Set([
  'wanderlust.witus.online',
  'www.wanderlust.witus.online',
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
  if (!trimmed) return { url: null, error: 'Paste a Wanderlust tour link or embed code.' }

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
      error: 'The link must be a wanderlust.witus.online tour.',
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
