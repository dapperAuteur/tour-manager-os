import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, ListMusic } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/modules/queries'
import { getInputLists } from '@/lib/production/queries'

export const metadata: Metadata = { title: 'Input Lists', robots: { index: false } }

export default async function InputListsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgMembership = await getUserOrg(user.id)
  if (!orgMembership) return <main id="main-content" className="p-8"><p className="text-text-secondary">Create an organization first.</p></main>

  const lists = await getInputLists(orgMembership.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/production" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Production Bible</Link>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Input Lists</h1>
        <Link href="/production/input-lists/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" aria-hidden="true" /> New Input List
        </Link>
      </div>

      {lists.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <ListMusic className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No input lists yet. Create a channel-by-channel patch sheet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => {
            const channelCount = Array.isArray(list.input_channels) ? list.input_channels.length : 0
            return (
              <div key={list.id} className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium">{list.name}</h2>
                    {list.is_default && <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">Default</span>}
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{channelCount} channel{channelCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
