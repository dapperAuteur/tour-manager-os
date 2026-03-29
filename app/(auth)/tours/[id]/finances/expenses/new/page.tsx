import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AddExpenseForm } from './add-expense-form'

export const metadata: Metadata = {
  title: 'Add Expense',
  robots: { index: false },
}

export default async function NewExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tourId } = await params
  const supabase = await createClient()

  const { data: shows } = await supabase
    .from('shows')
    .select('id, date, city, state, venue_name')
    .eq('tour_id', tourId)
    .order('date', { ascending: true })

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={`/tours/${tourId}/finances`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">
        &larr; Back to Finances
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Add Expense</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <AddExpenseForm tourId={tourId} shows={shows || []} />
      </div>
    </main>
  )
}
