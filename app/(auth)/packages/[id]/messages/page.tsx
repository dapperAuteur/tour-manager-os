import type { Metadata } from 'next'
import Link from 'next/link'
import { MessagesSquare, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  getActsCurrentUserCanSpeakAs,
  listPackageMessages,
} from '@/lib/packages/messages'
import { MessageFeed } from './message-feed'

export const metadata: Metadata = {
  title: 'Cross-Act Messages',
  robots: { index: false },
}

export default async function PackageMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: packageId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: pkg } = await supabase
    .from('tour_packages')
    .select('id, name')
    .eq('id', packageId)
    .maybeSingle()

  const [messages, speakableActs] = await Promise.all([
    listPackageMessages(packageId),
    getActsCurrentUserCanSpeakAs(packageId),
  ])

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href={`/packages/${packageId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Back to package
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <MessagesSquare className="size-5" aria-hidden /> Cross-Act Messages
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          One channel for every act on {pkg?.name || 'this package'} — share
          setlist changes, load-in updates, hospitality requests, anything
          that needs to reach the other bands fast.
        </p>
      </header>
      <MessageFeed
        packageId={packageId}
        currentUserId={user.id}
        messages={messages}
        actsCurrentUserCanSpeakAs={speakableActs}
      />
    </main>
  )
}
