import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Music, Clock, Phone, Mail, Calendar } from 'lucide-react'
import { getTourPackageWithActs } from '@/lib/packages/queries'
import { AddActForm } from './add-act-form'

export const metadata: Metadata = { title: 'Tour Package', robots: { index: false } }

const actTypeColors: Record<string, string> = {
  headliner: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  support: 'bg-success-500/20 text-success-600 dark:text-success-500',
  opener: 'bg-warning-500/20 text-warning-600 dark:text-warning-500',
  special_guest: 'bg-error-500/20 text-error-500',
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data
  try { data = await getTourPackageWithActs(id) } catch { notFound() }

  const { package: pkg, acts } = data

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/packages" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Tour Packages</Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{pkg.name}</h1>
          {pkg.description && <p className="mt-1 text-text-secondary">{pkg.description}</p>}
          <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
            <span className="capitalize">{pkg.package_type}</span>
            {pkg.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {new Date(pkg.start_date).toLocaleDateString()}{pkg.end_date ? ` – ${new Date(pkg.end_date).toLocaleDateString()}` : ''}
              </span>
            )}
          </div>
        </div>
        <Link href={`/packages/${id}/timeline`} className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium hover:bg-surface-alt">
          Timeline
        </Link>
      </div>

      {/* Acts */}
      <h2 className="mb-4 text-lg font-semibold">Acts ({acts.length})</h2>

      {acts.length > 0 && (
        <div className="mb-8 space-y-3">
          {acts.map((act) => (
            <div key={act.id} className="rounded-xl border border-border-default bg-surface-raised p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    <h3 className="font-semibold">{act.act_name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${actTypeColors[act.act_type]}`}>
                      {act.act_type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    {act.set_length_minutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{act.set_length_minutes} min set</span>}
                    {act.contact_name && <span>{act.contact_name}</span>}
                    {act.contact_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" aria-hidden="true" />{act.contact_phone}</span>}
                    {act.contact_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" aria-hidden="true" />{act.contact_email}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Act */}
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <h3 className="mb-4 font-semibold">Add Act</h3>
        <AddActForm packageId={id} />
      </div>
    </main>
  )
}
