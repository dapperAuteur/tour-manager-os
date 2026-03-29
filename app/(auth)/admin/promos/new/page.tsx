import type { Metadata } from 'next'
import Link from 'next/link'
import { NewPromoForm } from './new-promo-form'

export const metadata: Metadata = { title: 'New Promo Code', robots: { index: false } }

export default function NewPromoPage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/admin/subscriptions" className="mb-4 inline-block text-sm text-text-muted hover:text-text-secondary">&larr; Back</Link>
      <h1 className="mb-6 text-2xl font-bold">Create Promo Code</h1>
      <div className="rounded-xl border border-border-default bg-surface-raised p-6">
        <NewPromoForm />
      </div>
    </main>
  )
}
