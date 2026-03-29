import type { Metadata } from 'next'
import Link from 'next/link'
import { NewFeedbackForm } from './new-feedback-form'

export const metadata: Metadata = { title: 'New Feedback', robots: { index: false } }

export default function NewFeedbackPage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/feedback" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back to Feedback</Link>
      <h1 className="mb-6 text-2xl font-bold">Send Feedback</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <NewFeedbackForm />
      </div>
    </main>
  )
}
