import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { listOrgRiderTemplate } from '@/lib/rider/queries'
import { TemplateEditor } from './template-editor'

export const metadata: Metadata = {
  title: 'Rider Template',
  robots: { index: false },
}

export default async function RiderTemplatePage() {
  const items = await listOrgRiderTemplate()

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/settings"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> Settings
      </Link>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardCheck className="size-5" aria-hidden /> Rider Template
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your default rider — items the band needs at every show. On any
          show, click &ldquo;Import org template&rdquo; to stamp these onto
          a per-show compliance checklist the production crew checks off
          at load-in.
        </p>
      </header>
      <TemplateEditor initial={items} />
    </main>
  )
}
