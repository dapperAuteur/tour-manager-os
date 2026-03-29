'use client'

import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { activateModule, requestModuleAccess } from '@/lib/modules/actions'

interface ModuleCardProps {
  module: {
    id: string
    name: string
    description: string
    icon: string
    tier: string
  }
  orgId: string
  enabled: boolean
  accessStatus: string | null
}

const tierColors: Record<string, string> = {
  free: 'bg-success-500/20 text-success-600 dark:text-success-500',
  pro: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  enterprise: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
}

export function ModuleCard({ module, orgId, enabled, accessStatus }: ModuleCardProps) {
  const [status, setStatus] = useState(accessStatus)
  const [loading, setLoading] = useState(false)

  // Get icon component dynamically
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[module.icon] || LucideIcons.Box

  async function handleActivate() {
    setLoading(true)
    const result = await activateModule(orgId, module.id)
    if (result.success) setStatus('active')
    setLoading(false)
  }

  async function handleRequest() {
    setLoading(true)
    const result = await requestModuleAccess(orgId, module.id)
    if (result.success) setStatus('requested')
    setLoading(false)
  }

  const isActive = status === 'active'
  const isRequested = status === 'requested'

  return (
    <div className={`
      rounded-xl border p-5 transition-shadow
      ${isActive
        ? 'border-primary-500/30 bg-primary-500/5'
        : 'border-border-default bg-surface-raised'
      }
    `}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt">
          <IconComponent className="h-5 w-5 text-text-secondary" aria-hidden="true" />
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tierColors[module.tier]}`}>
          {module.tier}
        </span>
      </div>

      <h3 className="mb-1 text-sm font-semibold">{module.name}</h3>
      <p className="mb-4 text-xs text-text-secondary">{module.description}</p>

      {isActive ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-success-600 dark:text-success-500">
          <LucideIcons.Check className="h-3 w-3" aria-hidden="true" />
          Active
        </span>
      ) : isRequested ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-600 dark:text-warning-500">
          <LucideIcons.Clock className="h-3 w-3" aria-hidden="true" />
          Requested
        </span>
      ) : enabled ? (
        <button
          type="button"
          onClick={handleActivate}
          disabled={loading}
          className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Activating...' : 'Activate'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRequest}
          disabled={loading}
          className="rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-alt disabled:opacity-50"
        >
          {loading ? 'Requesting...' : 'Request Access'}
        </button>
      )}
    </div>
  )
}
