import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Fields we copy forward from the most-recent submitted advance for the
 * same venue. Anything time-sensitive (load-in / soundcheck / doors /
 * curfew / ticket price / total gross) is intentionally excluded — those
 * change per show and pre-filling them would mislead the venue.
 *
 * The current advance sheet's own values always win — we only fill in
 * fields the current sheet has left blank.
 */
const COPY_FORWARD_FIELDS = [
  'venue_type',
  'venue_capacity',
  'venue_address',
  'venue_phone',
  'venue_backstage_phone',
  'venue_fax',
  'dressing_room_count',
  'dressing_room_location',
  'dressing_room_lockable',
  'dressing_room_washbasin',
  'dressing_room_toilet',
  'dressing_room_shower',
  'security_guard_name',
  'security_guard_phone',
  'hospitality_provider_name',
  'hospitality_provider_phone',
  'per_diem_contact_name',
  'caterer_name',
  'caterer_phone',
  'stage_width',
  'stage_depth',
  'stage_height',
  'pa_system',
  'has_stage_door',
  'has_rear_door',
  'has_backstage_parking',
  'has_smoke_machines',
  'smoke_machine_notes',
  'merch_area_description',
] as const

export interface SmartDefaults {
  /** Field values pulled from the most-recent submitted advance for this venue. */
  defaults: Partial<Record<string, unknown>>
  /** Pretty source label for the pre-fill banner ("Cat's Cradle on Mar 12, 2026"). */
  sourceLabel: string | null
  /** Number of fields actually pre-filled into the current sheet. */
  filledCount: number
}

/**
 * Looks up the most-recent SUBMITTED advance sheet for shows whose
 * `venue_name` matches the current show's venue (case-insensitive), and
 * returns its values as suggested defaults. Returns empty defaults if no
 * match exists, the venue is blank, or no prior advance was submitted.
 *
 * Field-by-field merge: only blank values on the current sheet get
 * filled. The current sheet's data is never overwritten.
 */
export async function getSmartAdvanceDefaults(
  currentSheet: Record<string, unknown>,
  venueName: string | null,
  excludeSheetId: string,
): Promise<SmartDefaults> {
  if (!venueName) return { defaults: {}, sourceLabel: null, filledCount: 0 }

  const supabase = createAdminClient()

  // Find shows at the same venue (case-insensitive match).
  const { data: shows } = await supabase
    .from('shows')
    .select('id, date, venue_name')
    .ilike('venue_name', venueName)
    .limit(50)

  const showIds = (shows || []).map((s) => s.id)
  if (showIds.length === 0) {
    return { defaults: {}, sourceLabel: null, filledCount: 0 }
  }

  // Most-recent submitted advance for any of those shows, excluding
  // the current one.
  const { data: priorSheets } = await supabase
    .from('advance_sheets')
    .select('*, shows(date, venue_name)')
    .in('show_id', showIds)
    .eq('status', 'complete')
    .neq('id', excludeSheetId)
    .order('submitted_at', { ascending: false })
    .limit(1)

  const prior = priorSheets?.[0]
  if (!prior) return { defaults: {}, sourceLabel: null, filledCount: 0 }

  const defaults: Record<string, unknown> = {}
  let filledCount = 0
  for (const field of COPY_FORWARD_FIELDS) {
    const currentValue = currentSheet[field]
    const priorValue = (prior as Record<string, unknown>)[field]
    const currentIsBlank =
      currentValue === null || currentValue === undefined || currentValue === ''
    if (currentIsBlank && priorValue !== null && priorValue !== undefined && priorValue !== '') {
      defaults[field] = priorValue
      filledCount++
    }
  }

  const priorShow = prior.shows as { date?: string; venue_name?: string } | null
  let sourceLabel: string | null = null
  if (priorShow?.date) {
    const formatted = new Date(priorShow.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    sourceLabel = priorShow.venue_name
      ? `${priorShow.venue_name} on ${formatted}`
      : `prior show on ${formatted}`
  }

  return { defaults, sourceLabel, filledCount }
}
