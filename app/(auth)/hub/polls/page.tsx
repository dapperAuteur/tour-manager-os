import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Vote } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getPolls, getUserVotes } from '@/lib/hub/queries'
import { PollCard } from './poll-card'

export const metadata: Metadata = { title: 'Polls', robots: { index: false } }

export default async function PollsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="mx-auto max-w-4xl px-4 py-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const polls = await getPolls(orgMembership.org_id)

  // Get user's votes for each poll
  const userVotesMap: Record<string, Set<string>> = {}
  for (const poll of polls) {
    userVotesMap[poll.id] = await getUserVotes(poll.id, user.id)
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/hub" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Family Hub</Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Polls</h1>
        <Link href="/hub/polls/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> New Poll
        </Link>
      </div>

      {polls.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Vote className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No polls yet. Create one to get the group&apos;s input.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} userVotes={userVotesMap[poll.id]} />
          ))}
        </div>
      )}
    </main>
  )
}
