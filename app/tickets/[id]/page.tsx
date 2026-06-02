import { notFound } from 'next/navigation'
import { Calendar, MapPin, Music, Ticket as TicketIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { buildQrPayload, verifyTicketSignature } from '@/lib/tickets/sign'
import { TicketQr } from './ticket-qr'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function TicketHolderPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { token } = await searchParams

  const admin = createAdminClient()
  const { data: ticket } = await admin
    .from('tickets')
    .select(
      `id, ticket_type_id, show_id, purchaser_user_id, purchaser_email,
       purchaser_name, status, signature, issued_at, used_at,
       ticket_types(name, category, price),
       shows(date, city, state, venue_name, tour_id, tours(name, artist_name))`,
    )
    .eq('id', id)
    .maybeSingle()

  if (!ticket) notFound()

  let authorized = false
  if (
    token &&
    verifyTicketSignature(
      { id: ticket.id, show_id: ticket.show_id, issued_at: ticket.issued_at },
      token,
    )
  ) {
    authorized = true
  } else if (ticket.purchaser_user_id) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.id === ticket.purchaser_user_id) authorized = true
  }

  if (!authorized) notFound()

  type EmbeddedTour = { name: string | null; artist_name: string | null }
  type EmbeddedShow = {
    date: string
    city: string
    state: string | null
    venue_name: string | null
    tours: EmbeddedTour | EmbeddedTour[] | null
  }
  type EmbeddedTicketType = { name: string; category: string; price: number }
  const raw = ticket as unknown as {
    ticket_types: EmbeddedTicketType | EmbeddedTicketType[] | null
    shows: EmbeddedShow | EmbeddedShow[] | null
  }
  const ticketType = Array.isArray(raw.ticket_types) ? raw.ticket_types[0] : raw.ticket_types
  const show = Array.isArray(raw.shows) ? raw.shows[0] : raw.shows
  const tour = show
    ? Array.isArray(show.tours) ? show.tours[0] : show.tours
    : null

  const qrPayload = buildQrPayload(
    { id: ticket.id, show_id: ticket.show_id, issued_at: ticket.issued_at },
    ticket.signature,
  )

  const artist = tour?.artist_name || tour?.name || 'Tour'
  const venue =
    show?.venue_name ||
    (show ? `${show.city}${show.state ? ', ' + show.state : ''}` : '')

  const isUsed = ticket.status === 'used'
  const isVoided = ticket.status === 'refunded' || ticket.status === 'void'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="bg-blue-600 px-6 py-4 text-white">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80">
              <TicketIcon className="size-4" aria-hidden />
              {ticketType?.category || 'Ticket'}
            </div>
            <div className="mt-1 text-lg font-semibold">{ticketType?.name}</div>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold">{artist}</h1>
            <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {show && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" aria-hidden />
                    <time dateTime={show.date}>
                      {new Date(show.date).toLocaleDateString(undefined, {
                        weekday: 'long',
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
                </>
              )}
            </div>

            <div className="my-6 border-t border-dashed border-gray-200 dark:border-gray-700" />

            {isVoided ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                <p className="font-medium uppercase tracking-wide">
                  {ticket.status}
                </p>
                <p className="mt-1 text-sm">This ticket is no longer valid.</p>
              </div>
            ) : isUsed ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="font-medium">Already scanned</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Used at{' '}
                  {ticket.used_at &&
                    new Date(ticket.used_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <TicketQr payload={qrPayload} />
                <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                  Show this code at the door. It works without a network.
                </p>
                {token && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={`/api/tickets/${ticket.id}/pkpass?token=${encodeURIComponent(token)}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      Add to Apple Wallet
                    </a>
                    <a
                      href={`/api/tickets/${ticket.id}/google-wallet?token=${encodeURIComponent(token)}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-blue-700 bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                    >
                      Add to Google Wallet
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div>
                <div className="font-medium uppercase tracking-wide">
                  Holder
                </div>
                <div className="mt-0.5 text-gray-900 dark:text-gray-100">
                  {ticket.purchaser_name || ticket.purchaser_email}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium uppercase tracking-wide">ID</div>
                <div className="mt-0.5 font-mono text-[11px] text-gray-900 dark:text-gray-100">
                  {ticket.id.slice(0, 8)}…{ticket.id.slice(-4)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <Music className="mr-1 inline size-3" aria-hidden />
          Tour Manager OS
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
