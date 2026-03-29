import type { Metadata } from 'next'
import Link from 'next/link'
import { AddShowForm } from './add-show-form'

export const metadata: Metadata = {
  title: 'Add Show',
}

export default async function NewShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={`/tours/${id}`} className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">
        &larr; Back to Tour
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Add a Show</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <AddShowForm tourId={id} />
      </div>
    </main>
  )
}
