import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Ticket } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateTicketType } from '@/lib/tickets/actions'
import { TicketTypeForm } from '../../ticket-type-form'

export const metadata: Metadata = { title: 'Edit Ticket Type' }

interface PageProps {
  params: Promise<{ id: string; showId: string; ticketTypeId: string }>
}

export default async function EditTicketTypePage({ params }: PageProps) {
  const { id: tourId, showId, ticketTypeId } = await params

  // RLS will gate this — non-staff get null + a 404.
  const supabase = await createClient()
  const { data: ticketType } = await supabase
    .from('ticket_types')
    .select('id, name, category, price, quantity_available, description, active, quantity_sold')
    .eq('id', ticketTypeId)
    .eq('show_id', showId)
    .maybeSingle()

  if (!ticketType) notFound()

  async function action(formData: FormData) {
    'use server'
    return updateTicketType(tourId, showId, ticketTypeId, formData)
  }

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href={`/tours/${tourId}/shows/${showId}/tickets`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden /> Back to ticketing
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Ticket className="size-5 text-primary-600 dark:text-primary-400" aria-hidden />
        <h1 className="text-2xl font-bold sm:text-3xl">Edit ticket type</h1>
      </div>

      {ticketType.quantity_sold > 0 && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-200"
        >
          {ticketType.quantity_sold} ticket
          {ticketType.quantity_sold === 1 ? '' : 's'} already sold for this tier.
          You can still edit the name, description, and active flag safely.
          Changing the price won&apos;t refund or re-charge anyone — it only
          affects new sales. Cutting the inventory below the sold count is
          allowed (sales just stop), but never raise the price beyond what
          buyers expect to pay.
        </div>
      )}

      <TicketTypeForm
        tourId={tourId}
        showId={showId}
        initial={{
          name: ticketType.name,
          category: ticketType.category,
          price: ticketType.price,
          quantity_available: ticketType.quantity_available,
          description: ticketType.description,
          active: ticketType.active,
        }}
        submitLabel="Save changes"
        action={action}
        backHref={`/tours/${tourId}/shows/${showId}/tickets`}
      />
    </main>
  )
}
