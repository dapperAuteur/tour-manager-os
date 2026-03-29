'use client'

import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { votePoll } from '@/lib/hub/actions'

interface PollOption {
  id: string
  label: string
  poll_votes: { count: number }[] | number[]
}

interface PollCardProps {
  poll: {
    id: string
    question: string
    description: string | null
    status: string
    allow_multiple: boolean
    poll_options: PollOption[]
    user_profiles: { display_name: string | null } | null
    created_at: string
  }
  userVotes: Set<string>
}

export function PollCard({ poll, userVotes }: PollCardProps) {
  const [voted, setVoted] = useState(userVotes)
  const [loading, setLoading] = useState<string | null>(null)

  const totalVotes = poll.poll_options.reduce((sum, opt) => {
    const count = Array.isArray(opt.poll_votes) ? (typeof opt.poll_votes[0] === 'number' ? 0 : opt.poll_votes.length) : 0
    return sum + count
  }, 0)

  async function handleVote(optionId: string) {
    if (poll.status !== 'open') return
    setLoading(optionId)
    const result = await votePoll(poll.id, optionId)
    if (result.success) {
      setVoted((prev) => new Set([...prev, optionId]))
    }
    setLoading(null)
  }

  const authorName = (poll.user_profiles as { display_name: string | null })?.display_name || 'Unknown'
  const isOpen = poll.status === 'open'

  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{poll.question}</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isOpen ? 'bg-success-500/20 text-success-600 dark:text-success-500' : 'bg-text-muted/20 text-text-muted'}`}>
          {poll.status}
        </span>
      </div>
      {poll.description && <p className="mb-4 text-sm text-text-secondary">{poll.description}</p>}
      <p className="mb-4 text-xs text-text-muted">{authorName} &bull; {totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>

      <div className="space-y-2">
        {poll.poll_options.map((opt) => {
          const optVotes = Array.isArray(opt.poll_votes) ? opt.poll_votes.length : 0
          const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0
          const hasVoted = voted.has(opt.id)

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleVote(opt.id)}
              disabled={!isOpen || loading !== null}
              className={`relative flex w-full items-center gap-3 overflow-hidden rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-default ${
                hasVoted ? 'border-primary-500/50 bg-primary-500/5' : 'border-border-default hover:bg-surface-alt'
              }`}
            >
              {/* Progress bar */}
              <div
                className="absolute inset-y-0 left-0 bg-primary-500/10"
                style={{ width: `${pct}%` }}
                aria-hidden="true"
              />
              <span className="relative z-10">
                {hasVoted
                  ? <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  : <Circle className="h-4 w-4 text-text-muted" aria-hidden="true" />
                }
              </span>
              <span className="relative z-10 flex-1 font-medium">{opt.label}</span>
              <span className="relative z-10 text-xs text-text-muted">{pct}%</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
