'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme/theme-provider'

const options = [
  { value: 'light' as const, label: 'Light mode', icon: Sun },
  { value: 'dark' as const, label: 'Dark mode', icon: Moon },
  { value: 'system' as const, label: 'System preference', icon: Monitor },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div role="radiogroup" aria-label="Theme selection" className="flex gap-1">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={`
            flex items-center justify-center rounded-md p-2 transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            dark:focus:ring-offset-surface
            ${
              theme === value
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary dark:hover:bg-surface-alt'
            }
          `}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
