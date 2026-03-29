'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function submitAdvanceSheet(token: string, formData: FormData) {
  const supabase = createAdminClient()

  // Get advance sheet by token
  const { data: sheet, error: fetchError } = await supabase
    .from('advance_sheets')
    .select('id')
    .eq('token', token)
    .single()

  if (fetchError || !sheet) {
    return { error: 'Advance sheet not found' }
  }

  // Update advance sheet fields
  const { error: updateError } = await supabase
    .from('advance_sheets')
    .update({
      venue_type: formData.get('venue_type') as string || null,
      venue_capacity: formData.get('venue_capacity') ? Number(formData.get('venue_capacity')) : null,
      venue_address: formData.get('venue_address') as string || null,
      venue_phone: formData.get('venue_phone') as string || null,
      venue_backstage_phone: formData.get('venue_backstage_phone') as string || null,

      dressing_room_count: formData.get('dressing_room_count') ? Number(formData.get('dressing_room_count')) : null,
      dressing_room_location: formData.get('dressing_room_location') as string || null,
      dressing_room_lockable: formData.get('dressing_room_lockable') === 'yes',
      dressing_room_washbasin: formData.get('dressing_room_washbasin') === 'yes',
      dressing_room_toilet: formData.get('dressing_room_toilet') === 'yes',
      dressing_room_shower: formData.get('dressing_room_shower') === 'yes',
      security_guard_name: formData.get('security_guard_name') as string || null,
      security_guard_phone: formData.get('security_guard_phone') as string || null,

      hospitality_provider_name: formData.get('hospitality_provider_name') as string || null,
      hospitality_provider_phone: formData.get('hospitality_provider_phone') as string || null,
      per_diem_contact_name: formData.get('per_diem_contact_name') as string || null,
      caterer_name: formData.get('caterer_name') as string || null,
      caterer_phone: formData.get('caterer_phone') as string || null,
      meal_times: formData.get('meal_times') as string || null,

      stage_width: formData.get('stage_width') ? Number(formData.get('stage_width')) : null,
      stage_depth: formData.get('stage_depth') ? Number(formData.get('stage_depth')) : null,
      stage_height: formData.get('stage_height') ? Number(formData.get('stage_height')) : null,
      has_stage_door: formData.get('has_stage_door') === 'yes',
      has_rear_door: formData.get('has_rear_door') === 'yes',
      has_backstage_parking: formData.get('has_backstage_parking') === 'yes',
      pa_system: formData.get('pa_system') as string || null,
      has_smoke_machines: formData.get('has_smoke_machines') === 'yes',
      smoke_machine_notes: formData.get('smoke_machine_notes') as string || null,

      doors_time: formData.get('doors_time') as string || null,
      soundcheck_time: formData.get('soundcheck_time') as string || null,
      stage_time: formData.get('stage_time') as string || null,
      curfew_time: formData.get('curfew_time') as string || null,
      performance_length_minutes: formData.get('performance_length_minutes') ? Number(formData.get('performance_length_minutes')) : null,
      show_format: formData.get('show_format') as string || null,
      ticket_price: formData.get('ticket_price') ? Number(formData.get('ticket_price')) : null,
      total_gross: formData.get('total_gross') ? Number(formData.get('total_gross')) : null,
      smoking_allowed: formData.get('smoking_allowed') === 'yes',

      merch_area_description: formData.get('merch_area_description') as string || null,
      sound_company_name: formData.get('sound_company_name') as string || null,
      sound_company_phone: formData.get('sound_company_phone') as string || null,
      sound_company_email: formData.get('sound_company_email') as string || null,

      status: 'complete',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', sheet.id)

  if (updateError) {
    return { error: updateError.message }
  }

  // Save contacts
  const contactRoles = ['promoter', 'production', 'catering', 'sound'] as const
  for (const role of contactRoles) {
    const name = formData.get(`contact_${role}_name`) as string
    const phone = formData.get(`contact_${role}_phone`) as string
    const email = formData.get(`contact_${role}_email`) as string
    const company = formData.get(`contact_${role}_company`) as string

    if (name || phone || email || company) {
      await supabase.from('advance_contacts').upsert(
        {
          advance_sheet_id: sheet.id,
          role,
          contact_name: name || null,
          phone: phone || null,
          email: email || null,
          company_name: company || null,
        },
        { onConflict: 'advance_sheet_id,role', ignoreDuplicates: false }
      )
    }
  }

  // Update show status
  const { data: sheetData } = await supabase
    .from('advance_sheets')
    .select('show_id')
    .eq('id', sheet.id)
    .single()

  if (sheetData?.show_id) {
    await supabase
      .from('shows')
      .update({ status: 'confirmed' })
      .eq('id', sheetData.show_id)
  }

  return { success: true }
}
