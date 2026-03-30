import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Plane, Hotel, Car, Bus, Train, MapPin } from 'lucide-react'
import { getTravelArrangements } from '@/lib/travel/queries'
import { getTour } from '@/lib/tours/queries'

export const metadata: Metadata = { title: 'Travel Arrangements', robots: { index: false } }

const statusColors: Record<string, string> = {
  pending: 'bg-text-muted/20 text-text-muted',
  confirmed: 'bg-success-500/20 text-success-600 dark:text-success-500',
  cancelled: 'bg-error-500/20 text-error-600 dark:text-error-500',
}

const typeIcons: Record<string, typeof Plane> = {
  flight: Plane,
  hotel: Hotel,
  rental_car: Car,
  bus: Bus,
  train: Train,
}

export default async function TravelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tourId } = await params
  const tour = await getTour(tourId)
  const arrangements = await getTravelArrangements(tourId)

  // Group by type
  const grouped: Record<string, typeof arrangements> = {}
  for (const arr of arrangements) {
    const type = arr.type || 'other'
    if (!grouped[type]) grouped[type] = []
    grouped[type].push(arr)
  }

  const typeOrder = ['flight', 'hotel', 'rental_car', 'bus', 'train', 'other']
  const sortedTypes = Object.keys(grouped).sort((a, b) => {
    const ai = typeOrder.indexOf(a)
    const bi = typeOrder.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={`/tours/${tourId}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back to Tour</Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Travel Arrangements</h1>
          <p className="text-text-secondary">{tour.name}</p>
        </div>
        <Link href={`/tours/${tourId}/travel/new`} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add Travel
        </Link>
      </div>

      {arrangements.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No travel arrangements yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedTypes.map((type) => {
            const items = grouped[type]
            const Icon = typeIcons[type] || MapPin
            return (
              <section key={type}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold capitalize">
                  <Icon className="h-5 w-5 text-text-muted" aria-hidden="true" />
                  {type.replace('_', ' ')}s
                </h2>
                <div className="space-y-3">
                  {items.map((arr) => (
                    <div key={arr.id} className="rounded-xl border border-border-default bg-surface-raised p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          {arr.vendor && <h3 className="font-medium">{arr.vendor}</h3>}
                          {arr.confirmation_number && (
                            <p className="text-xs text-text-muted">Conf#: {arr.confirmation_number}</p>
                          )}
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[arr.status] || statusColors.pending}`}>
                          {arr.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-secondary">
                        {arr.check_in && (
                          <span>Check-in: {new Date(arr.check_in).toLocaleDateString()}</span>
                        )}
                        {arr.check_out && (
                          <span>Check-out: {new Date(arr.check_out).toLocaleDateString()}</span>
                        )}
                        {arr.cost != null && (
                          <span className="font-medium">${Number(arr.cost).toFixed(2)}</span>
                        )}
                      </div>
                      {arr.address && <p className="mt-1 text-xs text-text-muted">{arr.address}</p>}
                      {arr.phone && <p className="mt-1 text-xs text-text-muted">Phone: {arr.phone}</p>}
                      {arr.notes && <p className="mt-2 text-sm text-text-muted italic">{arr.notes}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}
