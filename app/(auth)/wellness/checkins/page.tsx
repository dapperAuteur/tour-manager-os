import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getFamilyCheckins } from '@/lib/wellness/queries'
import { CheckinForm } from './checkin-form'

export const metadata: Metadata = { title: 'Family Check-ins', robots: { index: false } }

const moodEmojis = ['', '😔', '😕', '😐', '🙂', '😄']

export default async function CheckinsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="p-8"><p className="text-text-secondary">Join an organization first.</p></main>

  const checkins = await getFamilyCheckins(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/wellness" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Wellness</Link>

      <h1 className="mb-2 text-2xl font-bold">Family Check-ins</h1>
      <p className="mb-8 text-sm text-text-secondary">How is everyone feeling about the tour? Start a check-in.</p>

      {/* New checkin */}
      <div className="mb-8 rounded-xl border border-border-default bg-surface-raised p-6">
        <h2 className="mb-4 font-semibold">Start a Check-in</h2>
        <CheckinForm orgId={orgMembership.org_id} />
      </div>

      {/* History */}
      {checkins.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No check-ins yet. Start one to hear from the group.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checkins.map((checkin) => {
            const responses = Array.isArray(checkin.checkin_responses) ? checkin.checkin_responses : []
            const authorName = (checkin.user_profiles as { display_name: string | null })?.display_name || 'Unknown'
            return (
              <div key={checkin.id} className="rounded-xl border border-border-default bg-surface-raised p-5">
                <p className="mb-1 font-medium">&ldquo;{checkin.prompt}&rdquo;</p>
                <p className="mb-4 text-xs text-text-muted">{authorName} &bull; {new Date(checkin.created_at).toLocaleDateString()}</p>

                {responses.length > 0 ? (
                  <div className="space-y-2">
                    {responses.map((r: { id: string; response: string; mood: number | null; user_profiles: { display_name: string | null } | null }) => (
                      <div key={r.id} className="rounded-lg bg-surface-alt p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{(r.user_profiles as { display_name: string | null })?.display_name || 'Unknown'}</span>
                          {r.mood && <span className="text-lg">{moodEmojis[r.mood]}</span>}
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">{r.response}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="flex items-center gap-1 text-xs text-text-muted">
                    <MessageCircle className="h-3 w-3" aria-hidden="true" /> No responses yet
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
