import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import {
  listShowRiderChecks,
  listOrgRiderTemplate,
  summarize,
} from '@/lib/rider/queries'
import { RiderChecklist } from './rider-checklist'

export const metadata: Metadata = {
  title: 'Rider Compliance',
  robots: { index: false },
}

export default async function ShowRiderPage({
  params,
}: {
  params: Promise<{ id: string; showId: string }>
}) {
  const { id: tourId, showId } = await params
  const [checks, template] = await Promise.all([
    listShowRiderChecks(showId),
    listOrgRiderTemplate(),
  ])
  const summary = summarize(checks)

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href={`/tours/${tourId}/shows/${showId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Back to show
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardCheck className="size-5" aria-hidden /> Rider Compliance
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Track what the venue actually delivered vs what the rider asked
          for. Use the &ldquo;Import template&rdquo; button to stamp your
          org&apos;s default rider on this show, then check each item off
          at load-in.
        </p>
        {summary.total > 0 && (
          <p className="mt-2 text-xs text-text-muted">
            <span className="text-success-600 dark:text-success-500">
              {summary.delivered} delivered
            </span>
            {' · '}
            <span className="text-warning-600 dark:text-warning-500">
              {summary.partial} partial
            </span>
            {' · '}
            <span className="text-error-600 dark:text-error-500">
              {summary.missing} missing
            </span>
            {' · '}
            <span>{summary.pending} pending</span>
            {' · '}
            <span>{summary.total} total</span>
          </p>
        )}
      </header>
      <RiderChecklist
        tourId={tourId}
        showId={showId}
        initial={checks}
        hasOrgTemplate={template.length > 0}
      />
    </main>
  )
}
