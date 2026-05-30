import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Ticket } from 'lucide-react'
import { createTicketType } from '@/lib/tickets/actions'
import { TicketTypeForm } from '../ticket-type-form'

export const metadata: Metadata = { title: 'New Ticket Type' }

interface PageProps {
  params: Promise<{ id: string; showId: string }>
}

export default async function NewTicketTypePage({ params }: PageProps) {
  const { id: tourId, showId } = await params

  async function action(formData: FormData) {
    'use server'
    return createTicketType(tourId, showId, formData)
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
        <h1 className="text-2xl font-bold sm:text-3xl">New ticket type</h1>
      </div>
      <p className="mb-6 text-sm text-text-muted">
        Add a tier for this show — General Admission, VIP, Reserved Seating,
        or a comp. As soon as you save, the public buy page shows it (unless
        you uncheck &ldquo;Visible on the public buy page&rdquo;).
      </p>

      <TicketTypeForm
        tourId={tourId}
        showId={showId}
        submitLabel="Create ticket type"
        action={action}
        backHref={`/tours/${tourId}/shows/${showId}/tickets`}
      />
    </main>
  )
}
