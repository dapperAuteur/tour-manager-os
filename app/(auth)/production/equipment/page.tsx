import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Guitar, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getEquipment } from '@/lib/production/queries'

export const metadata: Metadata = { title: 'Equipment', robots: { index: false } }

const conditionColors: Record<string, string> = {
  excellent: 'bg-success-500/20 text-success-600 dark:text-success-500',
  good: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  fair: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  needs_repair: 'bg-error-500/20 text-error-500',
  retired: 'bg-text-muted/20 text-text-muted',
}

export default async function EquipmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="p-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const equipment = await getEquipment(orgMembership.org_id)

  // Group by category
  const grouped: Record<string, typeof equipment> = {}
  for (const item of equipment) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/production" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Production Bible</Link>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipment Inventory</h1>
        <Link href="/production/equipment/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add Equipment
        </Link>
      </div>

      {equipment.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Guitar className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No equipment tracked yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted capitalize">{category.replace('_', ' ')}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border-default bg-surface-raised p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.quantity > 1 && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Package className="h-3 w-3" aria-hidden="true" /> x{item.quantity}
                        </span>
                      )}
                    </div>
                    {item.description && <p className="mb-2 text-sm text-text-secondary">{item.description}</p>}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.condition && (
                        <span className={`rounded-full px-2 py-0.5 font-medium ${conditionColors[item.condition]}`}>
                          {item.condition.replace('_', ' ')}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 ${item.travels_with_band ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400' : 'bg-surface-alt text-text-muted'}`}>
                        {item.travels_with_band ? 'Travels' : 'Stays home'}
                      </span>
                      {item.serial_number && <span className="text-text-muted">S/N: {item.serial_number}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
