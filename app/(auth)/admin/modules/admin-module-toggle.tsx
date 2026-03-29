'use client'

import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { toggleOrgModule } from '@/lib/modules/actions'

interface AdminModuleToggleProps {
  module: {
    id: string
    name: string
    description: string
    icon: string
    tier: string
  }
  orgId: string
  enabled: boolean
}

const tierLabels: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export function AdminModuleToggle({ module, orgId, enabled: initialEnabled }: AdminModuleToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [loading, setLoading] = useState(false)

  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[module.icon] || LucideIcons.Box

  async function handleToggle() {
    setLoading(true)
    const result = await toggleOrgModule(orgId, module.id, !enabled)
    if (result.success) setEnabled(!enabled)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt">
          <IconComponent className="h-5 w-5 text-text-secondary" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{module.name}</h3>
            <span className="text-xs text-text-muted">({tierLabels[module.tier]})</span>
          </div>
          <p className="text-xs text-text-secondary">{module.description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? 'Disable' : 'Enable'} ${module.name}`}
        onClick={handleToggle}
        disabled={loading}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface
          disabled:opacity-50
          ${enabled ? 'bg-primary-600' : 'bg-text-muted/30'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}
