import { TIMEZONE_GROUPS, DEFAULT_TIMEZONE } from '@/lib/timezones'

interface TimezoneSelectProps {
  id?: string
  name: string
  defaultValue?: string | null
  required?: boolean
  className?: string
  /** Aria label for screen readers when there's no visible <label>. */
  ariaLabel?: string
}

/**
 * Shared timezone `<select>` rendering every IANA zone we support,
 * grouped by region via `<optgroup>` for scanability. Used everywhere
 * a user picks a timezone (settings, advance sheet, show creation,
 * CSV import — anywhere a tour goes through multiple countries).
 */
export function TimezoneSelect({
  id,
  name,
  defaultValue,
  required,
  className,
  ariaLabel,
}: TimezoneSelectProps) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue || DEFAULT_TIMEZONE}
      required={required}
      aria-label={ariaLabel}
      className={
        className ??
        'w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt'
      }
    >
      {TIMEZONE_GROUPS.map((group) => (
        <optgroup key={group.region} label={group.region}>
          {group.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
