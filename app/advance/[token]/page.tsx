import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Music } from 'lucide-react'
import { getAdvanceSheetByToken } from '@/lib/tours/queries'
import { AdvanceSheetForm } from './advance-sheet-form'

export const metadata: Metadata = {
  title: 'Advance Sheet',
}

export default async function AdvanceSheetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let sheet
  try {
    sheet = await getAdvanceSheetByToken(token)
  } catch {
    notFound()
  }

  if (!sheet) notFound()

  const show = sheet.shows as { date: string; city: string; state: string | null; venue_name: string | null; tours: { name: string; artist_name: string } }
  const isSubmitted = sheet.status === 'complete'

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900">
          <Music className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold">{show.tours.artist_name}</h1>
        <p className="text-text-secondary">{show.tours.name}</p>
        <p className="mt-1 text-sm text-text-muted">
          {new Date(show.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' '}&mdash;{' '}
          {show.venue_name || show.city}{show.state ? `, ${show.state}` : ''}
        </p>
      </div>

      {isSubmitted ? (
        <div className="rounded-xl border border-success-500/30 bg-success-500/10 p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold text-success-600 dark:text-success-500">
            Advance Sheet Submitted
          </h2>
          <p className="text-sm text-text-secondary">
            Thank you! This advance sheet was submitted on{' '}
            {sheet.submitted_at ? new Date(sheet.submitted_at).toLocaleDateString() : 'a previous date'}.
            If you need to make changes, please contact the tour manager.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
            <p className="text-sm text-text-secondary">
              Please fill in this questionnaire and submit. All fields are optional — fill in what you can.
              The tour manager will follow up on anything missing.
            </p>
          </div>
          <AdvanceSheetForm token={token} sheet={sheet} />
        </>
      )}
    </main>
  )
}
