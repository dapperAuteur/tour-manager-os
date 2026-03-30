import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NewTravelForm } from './new-travel-form'

export const metadata: Metadata = { title: 'New Travel Arrangement', robots: { index: false } }

export default async function NewTravelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tourId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={`/tours/${tourId}/travel`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back to Travel</Link>
      <h1 className="mb-6 text-2xl font-bold">Add Travel Arrangement</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <NewTravelForm tourId={tourId} />
      </div>
    </main>
  )
}
