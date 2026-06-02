import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Split } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { listSplitsForExpense } from '@/lib/finances/split-queries'
import { SplitEditor } from './split-editor'
import { ReceiptViewer } from './receipt-viewer'

export const metadata: Metadata = {
  title: 'Expense — Split',
  robots: { index: false },
}

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string; expenseId: string }>
}) {
  const { id: tourId, expenseId } = await params
  const supabase = await createClient()

  const [{ data: expense }, splits] = await Promise.all([
    supabase
      .from('expenses')
      .select(
        `id, tour_id, member_id, date, category, description, amount,
         receipt_url, is_tax_deductible, status,
         tours:tour_id(org_id)`,
      )
      .eq('id', expenseId)
      .maybeSingle(),
    listSplitsForExpense(expenseId),
  ])
  if (!expense) notFound()

  const orgId = (expense.tours as unknown as { org_id: string } | null)?.org_id
  const { data: membersRaw } = orgId
    ? await supabase
        .from('org_members')
        .select('user_id, user_profiles:user_id(display_name)')
        .eq('org_id', orgId)
    : { data: [] as Array<{ user_id: string; user_profiles: { display_name: string | null } | null }> }
  const members = (membersRaw || []).map((m) => ({
    user_id: m.user_id,
    display_name:
      (m.user_profiles as unknown as { display_name: string | null } | null)
        ?.display_name ?? 'Member',
  }))

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const currentUserId = user?.id ?? ''

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
          <Split className="size-5" aria-hidden /> Split this expense
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {expense.description || 'Untitled expense'} —{' '}
          <span className="font-semibold">
            ${Number(expense.amount).toFixed(2)}
          </span>{' '}
          on{' '}
          {new Date(expense.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </header>

      {expense.receipt_url && (
        <section
          aria-labelledby="receipt-heading"
          className="mb-6 rounded-xl border border-border-default bg-surface-raised p-5"
        >
          <h2
            id="receipt-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted"
          >
            Receipt
          </h2>
          <ReceiptViewer url={expense.receipt_url as string} />
        </section>
      )}

      <SplitEditor
        expenseId={expenseId}
        expenseAmount={Number(expense.amount)}
        members={members}
        currentUserId={currentUserId}
        filerUserId={expense.member_id ?? null}
        initialSplits={splits}
      />
    </main>
  )
}
