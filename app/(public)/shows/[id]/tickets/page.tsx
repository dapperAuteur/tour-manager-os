import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Music } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { BuyForm } from './buy-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Tickets',
}

export default async function TicketsPage({ params }: PageProps) {
  const { id: showId } = await params
  const supabase = createAdminClient()

  const { data: show } = await supabase
    .from('shows')
    .select('id, date, city, state, venue_name, tour_id, tours(name, artist_name)')
    .eq('id', showId)
    .maybeSingle()

  if (!show) notFound()

  const { data: ticketTypes } = await supabase
    .from('ticket_types')
    .select('id, name, category, price, quantity_available, quantity_sold, description')
    .eq('show_id', showId)
    .eq('active', true)
    .order('price', { ascending: true })

  type EmbeddedTour = { name: string | null; artist_name: string | null }
  const tours = show.tours as EmbeddedTour | EmbeddedTour[] | null
  const tour = Array.isArray(tours) ? tours[0] : tours
  const artist = tour?.artist_name || tour?.name || 'Tour'
  const venue =
    show.venue_name ||
    `${show.city}${show.state ? ', ' + show.state : ''}`

  const onSale = (ticketTypes || []).filter(
    (t) =>
      Number(t.price) > 0 &&
      (t.quantity_available === null ||
        t.quantity_sold < t.quantity_available),
  )

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <Music className="size-4" aria-hidden />
            Tickets
          </div>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{artist}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" aria-hidden />
              <time dateTime={show.date}>
                {new Date(show.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden />
              {venue}
            </div>
          </div>
        </div>

        {onSale.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <p className="font-medium">No tickets currently on sale.</p>
            <p className="mt-1 text-sm">
              Check back later, or contact the tour for guest list inquiries.
            </p>
          </div>
        ) : (
          <BuyForm
            showId={showId}
            ticketTypes={onSale.map((t) => ({
              id: t.id,
              name: t.name,
              category: t.category,
              price: Number(t.price),
              description: t.description,
              remaining:
                t.quantity_available === null
                  ? null
                  : t.quantity_available - t.quantity_sold,
            }))}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
