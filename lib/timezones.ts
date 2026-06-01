/**
 * Canonical IANA timezone list for the app. Grouped by region so the
 * picker stays readable. Use `<TimezoneSelect>` (or render the
 * `TIMEZONE_GROUPS` array yourself) anywhere we currently hard-coded
 * a small US-only list.
 *
 * Conventions:
 *   - `value` is the IANA name (what JavaScript's Intl APIs expect).
 *   - `label` is a human-friendly name, often including the closest
 *     major city for disambiguation.
 *   - DEFAULT is `America/New_York` for back-compat with all existing
 *     callers that hard-coded that value.
 */

export const DEFAULT_TIMEZONE = 'America/New_York'

export interface TimezoneOption {
  value: string
  label: string
}

export interface TimezoneGroup {
  region: string
  options: TimezoneOption[]
}

export const TIMEZONE_GROUPS: TimezoneGroup[] = [
  {
    region: 'United States & Canada',
    options: [
      { value: 'America/New_York', label: 'Eastern (ET) — New York' },
      { value: 'America/Chicago', label: 'Central (CT) — Chicago' },
      { value: 'America/Denver', label: 'Mountain (MT) — Denver' },
      { value: 'America/Phoenix', label: 'Mountain no DST — Phoenix' },
      { value: 'America/Los_Angeles', label: 'Pacific (PT) — Los Angeles' },
      { value: 'America/Anchorage', label: 'Alaska — Anchorage' },
      { value: 'Pacific/Honolulu', label: 'Hawaii — Honolulu' },
      { value: 'America/Toronto', label: 'Eastern — Toronto' },
      { value: 'America/Vancouver', label: 'Pacific — Vancouver' },
      { value: 'America/Edmonton', label: 'Mountain — Edmonton' },
      { value: 'America/Halifax', label: 'Atlantic — Halifax' },
      { value: 'America/St_Johns', label: 'Newfoundland — St. John’s' },
    ],
  },
  {
    region: 'Mexico, Central & South America',
    options: [
      { value: 'America/Mexico_City', label: 'Mexico City' },
      { value: 'America/Tijuana', label: 'Tijuana' },
      { value: 'America/Monterrey', label: 'Monterrey' },
      { value: 'America/Guatemala', label: 'Guatemala City' },
      { value: 'America/Costa_Rica', label: 'San José (Costa Rica)' },
      { value: 'America/Panama', label: 'Panama City' },
      { value: 'America/Bogota', label: 'Bogotá' },
      { value: 'America/Lima', label: 'Lima' },
      { value: 'America/Santiago', label: 'Santiago de Chile' },
      { value: 'America/Sao_Paulo', label: 'São Paulo' },
      { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' },
      { value: 'America/Montevideo', label: 'Montevideo' },
    ],
  },
  {
    region: 'Europe & UK',
    options: [
      { value: 'Europe/London', label: 'GMT / BST — London' },
      { value: 'Europe/Dublin', label: 'Dublin' },
      { value: 'Europe/Lisbon', label: 'Lisbon' },
      { value: 'Europe/Paris', label: 'Paris' },
      { value: 'Europe/Amsterdam', label: 'Amsterdam' },
      { value: 'Europe/Brussels', label: 'Brussels' },
      { value: 'Europe/Berlin', label: 'Berlin' },
      { value: 'Europe/Madrid', label: 'Madrid' },
      { value: 'Europe/Zurich', label: 'Zürich' },
      { value: 'Europe/Vienna', label: 'Vienna' },
      { value: 'Europe/Rome', label: 'Rome' },
      { value: 'Europe/Copenhagen', label: 'Copenhagen' },
      { value: 'Europe/Stockholm', label: 'Stockholm' },
      { value: 'Europe/Oslo', label: 'Oslo' },
      { value: 'Europe/Helsinki', label: 'Helsinki' },
      { value: 'Europe/Warsaw', label: 'Warsaw' },
      { value: 'Europe/Prague', label: 'Prague' },
      { value: 'Europe/Budapest', label: 'Budapest' },
      { value: 'Europe/Athens', label: 'Athens' },
      { value: 'Europe/Bucharest', label: 'Bucharest' },
      { value: 'Europe/Istanbul', label: 'Istanbul' },
      { value: 'Europe/Moscow', label: 'Moscow' },
      { value: 'Europe/Kyiv', label: 'Kyiv' },
    ],
  },
  {
    region: 'Africa & Middle East',
    options: [
      { value: 'Africa/Casablanca', label: 'Casablanca' },
      { value: 'Africa/Lagos', label: 'Lagos' },
      { value: 'Africa/Cairo', label: 'Cairo' },
      { value: 'Africa/Johannesburg', label: 'Johannesburg' },
      { value: 'Africa/Nairobi', label: 'Nairobi' },
      { value: 'Asia/Jerusalem', label: 'Jerusalem' },
      { value: 'Asia/Beirut', label: 'Beirut' },
      { value: 'Asia/Dubai', label: 'Dubai' },
      { value: 'Asia/Riyadh', label: 'Riyadh' },
      { value: 'Asia/Tehran', label: 'Tehran' },
    ],
  },
  {
    region: 'Asia',
    options: [
      { value: 'Asia/Karachi', label: 'Karachi' },
      { value: 'Asia/Kolkata', label: 'Mumbai / Delhi (IST)' },
      { value: 'Asia/Dhaka', label: 'Dhaka' },
      { value: 'Asia/Bangkok', label: 'Bangkok' },
      { value: 'Asia/Jakarta', label: 'Jakarta' },
      { value: 'Asia/Singapore', label: 'Singapore' },
      { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur' },
      { value: 'Asia/Manila', label: 'Manila' },
      { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
      { value: 'Asia/Shanghai', label: 'Beijing / Shanghai' },
      { value: 'Asia/Taipei', label: 'Taipei' },
      { value: 'Asia/Seoul', label: 'Seoul' },
      { value: 'Asia/Tokyo', label: 'Tokyo' },
    ],
  },
  {
    region: 'Australia, New Zealand & Pacific',
    options: [
      { value: 'Australia/Perth', label: 'Perth' },
      { value: 'Australia/Adelaide', label: 'Adelaide' },
      { value: 'Australia/Brisbane', label: 'Brisbane' },
      { value: 'Australia/Sydney', label: 'Sydney' },
      { value: 'Australia/Melbourne', label: 'Melbourne' },
      { value: 'Australia/Hobart', label: 'Hobart' },
      { value: 'Australia/Darwin', label: 'Darwin' },
      { value: 'Pacific/Auckland', label: 'Auckland' },
      { value: 'Pacific/Fiji', label: 'Suva (Fiji)' },
      { value: 'Pacific/Guam', label: 'Guam' },
    ],
  },
  {
    region: 'UTC',
    options: [{ value: 'UTC', label: 'UTC' }],
  },
]

/** Flattened list (helpful when you need a set for validation). */
export const ALL_TIMEZONES: TimezoneOption[] = TIMEZONE_GROUPS.flatMap(
  (g) => g.options,
)
export const TIMEZONE_VALUES = new Set(ALL_TIMEZONES.map((t) => t.value))

export function isValidTimezone(value: string | null | undefined): boolean {
  if (!value) return false
  return TIMEZONE_VALUES.has(value)
}
