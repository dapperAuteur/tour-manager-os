import { createAdminClient } from '@/lib/supabase/admin'

export interface OrgTheme {
  org_id: string
  brand_name: string | null
  brand_logo_url: string | null
  brand_primary_color: string | null
  white_label_enabled: boolean
}

/**
 * Fetches the first org membership for this user and returns the org's
 * brand fields. Returns null when the user has no org or white-label is
 * disabled — the caller then falls back to the default Tour Manager OS
 * theme.
 */
export async function getActiveOrgTheme(
  userId: string,
): Promise<OrgTheme | null> {
  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('org_members')
    .select('org_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  if (!membership?.org_id) return null

  const { data: org } = await admin
    .from('organizations')
    .select(
      'id, brand_name, brand_logo_url, brand_primary_color, white_label_enabled',
    )
    .eq('id', membership.org_id)
    .maybeSingle()
  if (!org || !org.white_label_enabled) return null
  if (!org.brand_primary_color) return null

  return {
    org_id: org.id,
    brand_name: (org.brand_name as string | null) ?? null,
    brand_logo_url: (org.brand_logo_url as string | null) ?? null,
    brand_primary_color: (org.brand_primary_color as string | null) ?? null,
    white_label_enabled: true,
  }
}

interface RGB {
  r: number
  g: number
  b: number
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function hexToRgb(hex: string): RGB | null {
  let v = hex.trim().replace('#', '')
  if (v.length === 3) {
    v = v
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return null
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let s = 0
  let h = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      case bn:
        h = (rn - gn) / d + 4
        break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToRgb({
  h,
  s,
  l,
}: {
  h: number
  s: number
  l: number
}): RGB {
  const hn = h / 360
  const sn = s / 100
  const ln = l / 100
  if (sn === 0) {
    const v = Math.round(ln * 255)
    return { r: v, g: v, b: v }
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tn = t
    if (tn < 0) tn += 1
    if (tn > 1) tn -= 1
    if (tn < 1 / 6) return p + (q - p) * 6 * tn
    if (tn < 1 / 2) return q
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6
    return p
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  }
}

/**
 * Derives a Tailwind-style 50/100/.../900 palette from a single
 * base hex. The base is anchored at the 600 slot — same place the
 * default theme sits at #4553ea — and lightness ramps both directions
 * with a fixed curve. Not a perfect designer-grade ramp, but it
 * keeps logos readable and buttons hover-able without colour pickers
 * for each shade.
 */
export function shadesFromHex(hex: string): Record<string, string> {
  const rgb = hexToRgb(hex)
  if (!rgb) return {}
  const hsl = rgbToHsl(rgb)
  const targets: Record<string, number> = {
    '50': 96,
    '100': 92,
    '200': 84,
    '300': 74,
    '400': 64,
    '500': 56,
    '600': hsl.l, // anchor: keep user's exact color
    '700': Math.max(8, hsl.l - 10),
    '800': Math.max(6, hsl.l - 20),
    '900': Math.max(4, hsl.l - 30),
  }
  const out: Record<string, string> = {}
  for (const [shade, l] of Object.entries(targets)) {
    out[shade] = rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l }))
  }
  return out
}

/**
 * Renders the CSS custom property overrides for the org's primary
 * palette. Empty string when the theme is null or the hex is invalid
 * so we never inject broken styles.
 */
export function brandThemeCss(theme: OrgTheme | null): string {
  if (!theme?.brand_primary_color) return ''
  const shades = shadesFromHex(theme.brand_primary_color)
  if (Object.keys(shades).length === 0) return ''
  const decls = Object.entries(shades)
    .map(([k, v]) => `--color-primary-${k}: ${v};`)
    .join(' ')
  return `:root{${decls}}`
}
