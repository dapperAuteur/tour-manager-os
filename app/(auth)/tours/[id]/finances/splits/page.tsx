import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Split } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { listRevenueSplits } from '@/lib/stripe-connect/queries'
import { SplitsEditor } from './splits-editor'

export const metadata: Metadata = {
  title: 'Revenue Splits',
  robots: { index: false },
}

export default async function RevenueSplitsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: tourId } = await params
  const supabase = await createClient()
  const { data: tour } = await supabase
    .from('tours')
    .select('id, name')
    .eq('id', tourId)
    .maybeSingle()

  const [splits, members] = await Promise.all([
    listRevenueSplits(tourId),
    supabase
      .from('tour_members')
      .select('user_id, role, user_profiles:user_id(display_name)')
      .eq('tour_id', tourId),
  ])

  const memberList = (members.data || []).map((m) => ({
    user_id: m.user_id,
    role: m.role,
    display_name:
      (m.user_profiles as unknown as { display_name: string | null } | null)
        ?.display_name ?? 'Member',
  }))

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href={`/tours/${tourId}/finances`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Back to finances
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Split className="size-5" aria-hidden /> Revenue splits
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {tour?.name ?? 'Tour'} · who gets what cut of ticket + merch
          revenue. Percentages must total 100% before the platform will
          route payouts.
        </p>
      </header>

      <SplitsEditor
        tourId={tourId}
        initialSplits={splits}
        members={memberList}
      />
    </main>
  )
}
