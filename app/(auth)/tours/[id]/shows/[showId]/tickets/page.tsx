import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronLeft,
  Ticket as TicketIcon,
  ScanLine,
  DollarSign,
  AlertTriangle,
  Plus,
  Pencil,
} from 'lucide-react'
import { getShow } from '@/lib/tours/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { DeleteTicketTypeButton } from './delete-ticket-type-button'

export const metadata: Metadata = {
  title: 'Ticket Dashboard',
}

interface PageProps {
  params: Promise<{ id: string; showId: string }>
}

const RESULT_LABEL: Record<string, string> = {
  ok: 'Admitted',
  already_used: 'Already used',
  invalid_sig: 'Forged code',
  wrong_show: 'Wrong show',
  refunded: 'Refunded',
  void: 'Voided',
  not_found: 'Not found',
}

const RESULT_TONE: Record<string, string> = {
  ok: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
  already_used:
    'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
  invalid_sig: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  wrong_show: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  refunded: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  void: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  not_found: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
        <Icon className="size-4" aria-hidden /> {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-text-muted">{hint}</div>}
    </div>
  )
}

export default async function TicketsDashboardPage({ params }: PageProps) {
  const { id: tourId, showId } = await params
  const show = await getShow(showId)

  // After getShow's RLS check passes, switch to admin client for unfiltered
  // aggregates (ticket counts, scan logs).
  const admin = createAdminClient()

  const [{ data: ticketTypes }, { data: tickets }, { data: scans }] =
    await Promise.all([
      admin
        .from('ticket_types')
        .select('id, name, category, price, quantity_available, quantity_sold, active')
        .eq('show_id', showId)
        .order('price', { ascending: true }),
      admin
        .from('tickets')
        .select('status, amount_paid, ticket_type_id')
        .eq('show_id', showId),
      admin
        .from('scan_logs')
        .select(
          'id, ticket_id, result, created_at, attempted_ticket_id, scanned_by_user_id, device_id',
        )
        .eq('show_id', showId)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

  const totals = (tickets || []).reduce(
    (acc, t) => {
      acc.total++
      acc.revenue += Number(t.amount_paid || 0)
      if (t.status === 'used') acc.used++
      if (t.status === 'refunded') acc.refunded++
      if (t.status === 'issued') acc.issued++
      return acc
    },
    { total: 0, used: 0, refunded: 0, issued: 0, revenue: 0 },
  )

  const usedByType = new Map<string, number>()
  for (const t of tickets || []) {
    if (t.status === 'used') {
      usedByType.set(t.ticket_type_id, (usedByType.get(t.ticket_type_id) || 0) + 1)
    }
  }

  const scanRate =
    totals.issued + totals.used > 0
      ? totals.used / (totals.issued + totals.used)
      : 0

  const venue =
    show.venue_name ||
    `${show.city}${show.state ? ', ' + show.state : ''}`

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href={`/tours/${tourId}/shows/${showId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden /> Back to Show
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-text-muted">
            <TicketIcon className="size-4" aria-hidden /> Ticketing
          </div>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{venue}</h1>
          <p className="mt-1 text-sm text-text-muted">
            <time dateTime={show.date}>
              {new Date(show.date).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/tours/${tourId}/shows/${showId}/tickets/new`}
            className="inline-flex items-center gap-2 rounded-md border border-primary-500/40 bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-500/20 dark:text-primary-300"
          >
            <Plus className="size-4" aria-hidden /> New ticket type
          </Link>
          <Link
            href={`/tours/${tourId}/shows/${showId}/scanner`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <ScanLine className="size-4" aria-hidden /> Open Scanner
          </Link>
        </div>
      </div>

      <section
        aria-label="Summary"
        className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <StatCard
          icon={TicketIcon}
          label="Sold"
          value={String(totals.total - totals.refunded)}
          hint={
            totals.refunded > 0
              ? `${totals.refunded} refunded`
              : undefined
          }
        />
        <StatCard
          icon={ScanLine}
          label="Scanned in"
          value={String(totals.used)}
          hint={`${Math.round(scanRate * 100)}% of issued`}
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={formatPrice(totals.revenue)}
          hint="gross — before refunds"
        />
        <StatCard
          icon={AlertTriangle}
          label="Refunded"
          value={String(totals.refunded)}
        />
      </section>

      <section
        aria-label="Ticket types"
        className="mb-8 rounded-2xl border border-border-default bg-surface-raised"
      >
        <header className="border-b border-border-default px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            By type
          </h2>
        </header>
        {(!ticketTypes || ticketTypes.length === 0) ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-text-muted">
              No ticket types yet — nothing for fans to buy.
            </p>
            <Link
              href={`/tours/${tourId}/shows/${showId}/tickets/new`}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <Plus className="size-4" aria-hidden /> Create the first one
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Price</th>
                <th className="px-4 py-2 font-medium">Sold</th>
                <th className="px-4 py-2 font-medium">Used</th>
                <th className="px-4 py-2 font-medium">Inventory</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ticketTypes.map((t) => {
                const cap =
                  t.quantity_available === null
                    ? '∞'
                    : `${t.quantity_sold}/${t.quantity_available}`
                return (
                  <tr
                    key={t.id}
                    className="border-b border-border-default last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs uppercase tracking-wide text-text-muted">
                        {t.category}
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatPrice(Number(t.price))}</td>
                    <td className="px-4 py-3 font-medium">{t.quantity_sold}</td>
                    <td className="px-4 py-3 font-medium">
                      {usedByType.get(t.id) || 0}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{cap}</td>
                    <td className="px-4 py-3">
                      {t.active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950/40 dark:text-green-300">
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tours/${tourId}/shows/${showId}/tickets/${t.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-md border border-border-default px-2 py-1 text-xs font-medium hover:bg-surface-alt"
                        >
                          <Pencil className="size-3" aria-hidden /> Edit
                        </Link>
                        <DeleteTicketTypeButton
                          tourId={tourId}
                          showId={showId}
                          ticketTypeId={t.id}
                          name={t.name}
                          hasSold={t.quantity_sold > 0}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      <section
        aria-label="Recent scans"
        className="rounded-2xl border border-border-default bg-surface-raised"
      >
        <header className="border-b border-border-default px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Scan log
          </h2>
        </header>
        {(!scans || scans.length === 0) ? (
          <div className="px-4 py-6 text-center text-sm text-text-muted">
            No scans yet.
          </div>
        ) : (
          <ol className="divide-y divide-border-default">
            {scans.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${RESULT_TONE[s.result] || ''}`}
                >
                  {RESULT_LABEL[s.result] || s.result}
                </span>
                <span className="hidden font-mono text-xs text-text-muted sm:inline">
                  {s.ticket_id
                    ? `${s.ticket_id.slice(0, 8)}…${s.ticket_id.slice(-4)}`
                    : '—'}
                </span>
                <span className="hidden font-mono text-xs text-text-muted sm:inline">
                  {s.device_id ? s.device_id.slice(0, 8) : '—'}
                </span>
                <time className="text-xs text-text-muted">
                  {new Date(s.created_at).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}
