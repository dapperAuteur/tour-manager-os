'use client'

import { useState } from 'react'
import { submitAdvanceSheet } from '@/lib/advance/actions'

interface AdvanceSheetFormProps {
  token: string
  sheet: Record<string, unknown>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-border-default bg-surface-raised p-5">
      <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
        {title}
      </legend>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  )
}

function Field({ label, id, type = 'text', placeholder, defaultValue }: {
  label: string; id: string; type?: string; placeholder?: string; defaultValue?: string | number | null
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
      />
    </div>
  )
}

function YesNo({ label, id, defaultValue }: { label: string; id: string; defaultValue?: boolean | null }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex gap-4" role="radiogroup" aria-label={label}>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name={id} value="yes" defaultChecked={defaultValue === true} className="accent-primary-600" />
          Yes
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name={id} value="no" defaultChecked={defaultValue === false} className="accent-primary-600" />
          No
        </label>
      </div>
    </div>
  )
}

export function AdvanceSheetForm({ token, sheet }: AdvanceSheetFormProps) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError('')
    setLoading(true)
    const result = await submitAdvanceSheet(token, formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-success-500/30 bg-success-500/10 p-8 text-center" role="status">
        <h2 className="mb-2 text-lg font-semibold text-success-600 dark:text-success-500">
          Thank You!
        </h2>
        <p className="text-sm text-text-secondary">
          Your advance sheet has been submitted successfully. The tour manager will be notified.
        </p>
      </div>
    )
  }

  const s = sheet as Record<string, string | number | boolean | null>

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </div>
      )}

      {/* Venue Details */}
      <Section title="Venue Details">
        <div>
          <label htmlFor="venue_type" className="mb-1 block text-sm font-medium">Venue Type</label>
          <select
            id="venue_type"
            name="venue_type"
            defaultValue={(s.venue_type as string) || ''}
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          >
            <option value="">Select type...</option>
            <option value="club">Club</option>
            <option value="theater">Theater</option>
            <option value="festival">Festival</option>
            <option value="outdoor">Outdoor</option>
            <option value="arena">Arena</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Capacity" id="venue_capacity" type="number" defaultValue={s.venue_capacity as number} />
          <Field label="Phone" id="venue_phone" type="tel" defaultValue={s.venue_phone as string} />
        </div>
        <Field label="Address" id="venue_address" defaultValue={s.venue_address as string} />
        <Field label="Backstage Number" id="venue_backstage_phone" type="tel" defaultValue={s.venue_backstage_phone as string} />
      </Section>

      {/* Dressing Rooms */}
      <Section title="Dressing Rooms">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="How many?" id="dressing_room_count" type="number" defaultValue={s.dressing_room_count as number} />
          <Field label="Where are they located?" id="dressing_room_location" defaultValue={s.dressing_room_location as string} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <YesNo label="Lockable doors?" id="dressing_room_lockable" defaultValue={s.dressing_room_lockable as boolean} />
          <YesNo label="Wash basin?" id="dressing_room_washbasin" defaultValue={s.dressing_room_washbasin as boolean} />
          <YesNo label="Toilet?" id="dressing_room_toilet" defaultValue={s.dressing_room_toilet as boolean} />
        </div>
        <YesNo label="Shower?" id="dressing_room_shower" defaultValue={s.dressing_room_shower as boolean} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Security Guard Name" id="security_guard_name" defaultValue={s.security_guard_name as string} />
          <Field label="Security Guard Phone" id="security_guard_phone" type="tel" defaultValue={s.security_guard_phone as string} />
        </div>
      </Section>

      {/* Catering */}
      <Section title="Catering & Hospitality">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hospitality Provider" id="hospitality_provider_name" defaultValue={s.hospitality_provider_name as string} />
          <Field label="Provider Phone" id="hospitality_provider_phone" type="tel" defaultValue={s.hospitality_provider_phone as string} />
        </div>
        <Field label="Per Diem Contact Name" id="per_diem_contact_name" placeholder="Person road manager receives per diem from" defaultValue={s.per_diem_contact_name as string} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Caterer Name" id="caterer_name" defaultValue={s.caterer_name as string} />
          <Field label="Caterer Phone" id="caterer_phone" type="tel" defaultValue={s.caterer_phone as string} />
        </div>
        <Field label="Meal Times" id="meal_times" placeholder="e.g., Lunch 1PM, Dinner 5PM" defaultValue={s.meal_times as string} />
      </Section>

      {/* Production */}
      <Section title="Production">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Stage Width (ft)" id="stage_width" type="number" defaultValue={s.stage_width as number} />
          <Field label="Stage Depth (ft)" id="stage_depth" type="number" defaultValue={s.stage_depth as number} />
          <Field label="Stage Height (ft)" id="stage_height" type="number" defaultValue={s.stage_height as number} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <YesNo label="Stage door?" id="has_stage_door" defaultValue={s.has_stage_door as boolean} />
          <YesNo label="Rear door?" id="has_rear_door" defaultValue={s.has_rear_door as boolean} />
          <YesNo label="Backstage parking?" id="has_backstage_parking" defaultValue={s.has_backstage_parking as boolean} />
        </div>
        <Field label="PA System" id="pa_system" placeholder="Type of PA" defaultValue={s.pa_system as string} />
        <YesNo label="Smoke machines?" id="has_smoke_machines" defaultValue={s.has_smoke_machines as boolean} />
        <Field label="Smoke machine notes" id="smoke_machine_notes" placeholder="Please do not use in excess during the show" defaultValue={s.smoke_machine_notes as string} />
      </Section>

      {/* Show Details */}
      <Section title="Show Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Soundcheck Time" id="soundcheck_time" type="time" defaultValue={s.soundcheck_time as string} />
          <Field label="Doors Time" id="doors_time" type="time" defaultValue={s.doors_time as string} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stage Time" id="stage_time" type="time" defaultValue={s.stage_time as string} />
          <Field label="Curfew" id="curfew_time" type="time" defaultValue={s.curfew_time as string} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Set Length (minutes)" id="performance_length_minutes" type="number" defaultValue={s.performance_length_minutes as number} />
          <div>
            <label htmlFor="show_format" className="mb-1 block text-sm font-medium">Format</label>
            <select
              id="show_format"
              name="show_format"
              defaultValue={(s.show_format as string) || ''}
              className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
            >
              <option value="">Select...</option>
              <option value="live">Live</option>
              <option value="playback">Playback</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ticket Price ($)" id="ticket_price" type="number" defaultValue={s.ticket_price as number} />
          <Field label="Total Gross ($)" id="total_gross" type="number" defaultValue={s.total_gross as number} />
        </div>
        <YesNo label="Smoking allowed?" id="smoking_allowed" defaultValue={s.smoking_allowed as boolean} />
        <Field label="Merch Area" id="merch_area_description" placeholder="Location and details for merch setup" defaultValue={s.merch_area_description as string} />
      </Section>

      {/* Contacts */}
      <Section title="Key Contacts">
        {['promoter', 'production', 'catering', 'sound'].map((role) => (
          <div key={role} className="rounded-lg border border-border-default p-4">
            <p className="mb-3 text-sm font-semibold capitalize">{role}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Company" id={`contact_${role}_company`} />
              <Field label="Contact Name" id={`contact_${role}_name`} />
              <Field label="Phone" id={`contact_${role}_phone`} type="tel" />
              <Field label="Email" id={`contact_${role}_email`} type="email" />
            </div>
          </div>
        ))}
      </Section>

      {/* Sound Company */}
      <Section title="Sound Company">
        <Field label="Company Name" id="sound_company_name" defaultValue={s.sound_company_name as string} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" id="sound_company_phone" type="tel" defaultValue={s.sound_company_phone as string} />
          <Field label="Email" id="sound_company_email" type="email" defaultValue={s.sound_company_email as string} />
        </div>
      </Section>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
      >
        {loading ? 'Submitting...' : 'Submit Advance Sheet'}
      </button>
    </form>
  )
}
