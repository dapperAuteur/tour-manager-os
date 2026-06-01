import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Flag, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { listPhotoReports } from '@/lib/photos/report-queries'
import { ResolveForm } from './resolve-form'

export const metadata: Metadata = {
  title: 'Fan Photo Reports',
  robots: { index: false },
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  reviewed: 'Reviewed',
  actioned: 'Actioned (taken down)',
  dismissed: 'Dismissed (kept up)',
}
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-warning-500/20 text-warning-700 dark:text-warning-400',
  reviewed: 'bg-primary-500/20 text-primary-700 dark:text-primary-400',
  actioned: 'bg-error-500/20 text-error-600 dark:text-error-500',
  dismissed: 'bg-text-muted/20 text-text-muted',
}

export default async function PhotoReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-text-secondary">Admin access required.</p>
      </main>
    )
  }

  const effectiveFilter = filter === 'all' ? 'all' : 'open'
  const reports = await listPhotoReports(effectiveFilter)

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Flag className="size-5 text-error-600 dark:text-error-500" aria-hidden /> Fan Photo Reports
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Abuse reports filed by users against published fan photos.
            Dismissing keeps the photo up; taking it down flips the photo
            status to <code>rejected</code> and auto-resolves any sibling
            reports on the same image.
          </p>
        </div>
        <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">
          Super Admin
        </span>
      </header>

      <nav aria-label="Filter" className="mb-5 flex gap-2 text-xs">
        <Link
          href="/admin/photo-reports"
          className={`rounded-md px-3 py-1.5 font-medium ${
            effectiveFilter === 'open'
              ? 'bg-primary-600 text-white'
              : 'border border-border-default hover:bg-surface-alt'
          }`}
        >
          Open only
        </Link>
        <Link
          href="/admin/photo-reports?filter=all"
          className={`rounded-md px-3 py-1.5 font-medium ${
            effectiveFilter === 'all'
              ? 'bg-primary-600 text-white'
              : 'border border-border-default hover:bg-surface-alt'
          }`}
        >
          All
        </Link>
      </nav>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Flag className="mx-auto mb-3 size-8 text-text-muted" aria-hidden />
          <p className="text-sm text-text-secondary">
            {effectiveFilter === 'open'
              ? 'No open reports. Inbox zero.'
              : 'No reports yet.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border-default bg-surface-raised p-4"
            >
              <div className="flex flex-wrap items-start gap-4">
                {r.photo?.cloudinary_url && (
                  <Link
                    href={`/photos/${r.photo.id}`}
                    target="_blank"
                    className="relative block size-32 shrink-0 overflow-hidden rounded-md border border-border-default bg-surface-alt"
                  >
                    <Image
                      src={r.photo.cloudinary_url}
                      alt={r.photo.caption || 'Reported fan photo'}
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized
                    />
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[r.status]}`}
                    >
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                    {r.reports_on_photo > 1 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-error-600 dark:text-error-500">
                        <AlertTriangle className="size-2.5" aria-hidden /> {r.reports_on_photo} open reports
                      </span>
                    )}
                    {r.photo && (
                      <span className="text-[11px] text-text-muted">
                        Photo status: <code>{r.photo.status}</code>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold">Reason:</span>{' '}
                    <span className="whitespace-pre-wrap text-text-secondary">
                      {r.reason}
                    </span>
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted">
                    <span>
                      Reported by{' '}
                      {r.reporter_name ? (
                        <span className="font-medium text-text-secondary">{r.reporter_name}</span>
                      ) : (
                        <em>anonymous</em>
                      )}{' '}
                      on {new Date(r.created_at).toLocaleDateString()}
                    </span>
                    {r.resolved_at && (
                      <span>
                        Resolved {new Date(r.resolved_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {r.resolution_notes && (
                    <p className="mt-1 text-xs italic text-text-secondary">
                      Resolution: {r.resolution_notes}
                    </p>
                  )}
                </div>
              </div>

              {r.status === 'open' && (
                <div className="mt-3 border-t border-border-default pt-3">
                  <ResolveForm reportId={r.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
